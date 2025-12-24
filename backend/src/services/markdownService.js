/**
 * Markdown Fetcher and Renderer Service
 * 
 * Fetches Markdown documentation from URLs or files
 * and renders to HTML with dark-themed code blocks
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

class MarkdownService {
  constructor() {
    this.FETCH_TIMEOUT = 30000; // 30 seconds
  }

  /**
   * Fetch Markdown from a URL
   * @param {String} url - Markdown URL
   * @returns {Promise<Object>} { success: boolean, markdown: string|null, error: string|null }
   */
  async fetchMarkdown(url) {
    try {
      logger.info(`Fetching Markdown from ${url}`);

      const response = await axios.get(url, {
        timeout: this.FETCH_TIMEOUT,
        headers: {
          'Accept': 'text/markdown, text/plain, text/*, */*',
          'User-Agent': 'PortSmith-MarkdownFetcher/1.0'
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const markdown = response.data;

      logger.info(`✅ Successfully fetched Markdown from ${url}`);

      return {
        success: true,
        markdown,
        error: null
      };

    } catch (error) {
      const errorMessage = error.response
        ? `HTTP ${error.response.status}: ${error.response.statusText}`
        : error.code === 'ECONNABORTED'
          ? 'Request timeout'
          : error.message;

      logger.warn(`Failed to fetch Markdown: ${errorMessage}`);

      return {
        success: false,
        markdown: null,
        error: errorMessage
      };
    }
  }

  /**
   * Load Markdown from local file
   * @param {String} filePath - Path to Markdown file
   * @returns {Promise<Object>} { success: boolean, markdown: string|null, error: string|null }
   */
  async loadMarkdownFile(filePath) {
    try {
      logger.info(`Loading Markdown from file: ${filePath}`);

      const resolvedPath = path.resolve(filePath);
      const markdown = await fs.readFile(resolvedPath, 'utf-8');

      logger.info(`✅ Successfully loaded Markdown from file`);

      return {
        success: true,
        markdown,
        error: null
      };

    } catch (error) {
      logger.warn(`Failed to load Markdown file: ${error.message}`);

      return {
        success: false,
        markdown: null,
        error: error.message
      };
    }
  }

  /**
   * Render Markdown to HTML with dark-themed code blocks
   * @param {String} markdown - Raw Markdown content
   * @param {Object} options - Rendering options
   * @returns {String} Rendered HTML
   */
  renderToHtml(markdown, options = {}) {
    const { 
      includeToc = true,
      codeTheme = 'dark',
      title = 'API Documentation'
    } = options;

    // Basic Markdown to HTML conversion
    // In production, use a library like 'marked' or 'markdown-it'
    let html = this._convertMarkdownToHtml(markdown);

    // Generate TOC if requested
    let toc = '';
    if (includeToc) {
      toc = this._generateToc(html);
    }

    // Wrap in styled container
    const styledHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this._escapeHtml(title)}</title>
  <style>
    ${this._getStyles(codeTheme)}
  </style>
</head>
<body>
  <div class="markdown-container">
    ${toc ? `<nav class="toc">${toc}</nav>` : ''}
    <div class="markdown-content">
      ${html}
    </div>
  </div>
</body>
</html>
    `.trim();

    return styledHtml;
  }

  /**
   * Calculate hash of Markdown for change detection
   * @param {String} markdown - Markdown content
   * @returns {String} SHA256 hash
   */
  calculateMarkdownHash(markdown) {
    return crypto.createHash('sha256').update(markdown).digest('hex');
  }

  /**
   * Basic Markdown to HTML conversion
   * @private
   */
  _convertMarkdownToHtml(markdown) {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${this._escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Lists (basic)
    html = html.replace(/<p>- (.+?)<\/p>/g, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul><ul>/g, '');

    return html;
  }

  /**
   * Generate table of contents from HTML
   * @private
   */
  _generateToc(html) {
    const headingRegex = /<h([2-3])>(.*?)<\/h\1>/g;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2]
      });
    }

    if (headings.length === 0) {
      return '';
    }

    let toc = '<h2>Table of Contents</h2><ul class="toc-list">';
    
    headings.forEach(heading => {
      const slug = heading.text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const indent = heading.level === 3 ? ' class="toc-indent"' : '';
      toc += `<li${indent}><a href="#${slug}">${heading.text}</a></li>`;
    });
    
    toc += '</ul>';

    return toc;
  }

  /**
   * Get CSS styles for Markdown rendering
   * @private
   */
  _getStyles(codeTheme) {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f5f5;
        padding: 20px;
      }

      .markdown-container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .toc {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 6px;
        margin-bottom: 30px;
        border-left: 4px solid #3B82F6;
      }

      .toc h2 {
        margin-bottom: 15px;
        color: #1a1a1a;
        font-size: 1.3em;
      }

      .toc-list {
        list-style: none;
      }

      .toc-list li {
        margin: 8px 0;
      }

      .toc-list li.toc-indent {
        margin-left: 20px;
      }

      .toc-list a {
        color: #3B82F6;
        text-decoration: none;
        transition: color 0.2s;
      }

      .toc-list a:hover {
        color: #2563eb;
        text-decoration: underline;
      }

      .markdown-content h1 {
        font-size: 2.5em;
        margin-bottom: 20px;
        color: #1a1a1a;
        border-bottom: 3px solid #3B82F6;
        padding-bottom: 10px;
      }

      .markdown-content h2 {
        font-size: 2em;
        margin-top: 40px;
        margin-bottom: 15px;
        color: #1a1a1a;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
      }

      .markdown-content h3 {
        font-size: 1.5em;
        margin-top: 30px;
        margin-bottom: 12px;
        color: #374151;
      }

      .markdown-content p {
        margin-bottom: 16px;
        color: #4b5563;
      }

      .markdown-content code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9em;
        color: #e11d48;
      }

      .markdown-content pre {
        background: ${codeTheme === 'dark' ? '#1a1a1a' : '#f3f4f6'};
        color: ${codeTheme === 'dark' ? '#e5e7eb' : '#1f2937'};
        padding: 20px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 20px 0;
        border: 1px solid ${codeTheme === 'dark' ? '#374151' : '#d1d5db'};
      }

      .markdown-content pre code {
        background: transparent;
        padding: 0;
        color: inherit;
        font-size: 0.95em;
        line-height: 1.5;
      }

      .markdown-content ul {
        margin: 15px 0;
        padding-left: 30px;
      }

      .markdown-content li {
        margin: 8px 0;
        color: #4b5563;
      }

      .markdown-content a {
        color: #3B82F6;
        text-decoration: none;
        transition: color 0.2s;
      }

      .markdown-content a:hover {
        color: #2563eb;
        text-decoration: underline;
      }

      .markdown-content strong {
        color: #1f2937;
        font-weight: 600;
      }

      .markdown-content em {
        font-style: italic;
      }

      @media (max-width: 768px) {
        .markdown-container {
          padding: 20px;
        }

        .markdown-content h1 {
          font-size: 2em;
        }

        .markdown-content h2 {
          font-size: 1.6em;
        }

        .markdown-content h3 {
          font-size: 1.3em;
        }
      }
    `;
  }

  /**
   * Escape HTML special characters
   * @private
   */
  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = new MarkdownService();
