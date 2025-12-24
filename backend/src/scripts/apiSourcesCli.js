#!/usr/bin/env node

/**
 * External API Sources Configuration CLI
 * 
 * Commands:
 *   node apiSourcesCli.js list              - List all configured sources
 *   node apiSourcesCli.js products          - List all products
 *   node apiSourcesCli.js validate          - Validate all configurations
 *   node apiSourcesCli.js summary           - Show configuration summary
 *   node apiSourcesCli.js show <slug>       - Show details for a specific source
 */

require('dotenv').config();
const externalApiSourceService = require('../services/externalApiSourceService');

const command = process.argv[2];
const arg = process.argv[3];

function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function listSources() {
  const sources = externalApiSourceService.getAllSources();
  
  console.log('\n=== External API Sources ===\n');
  sources.forEach(source => {
    console.log(`📦 ${source.name} (${source.slug})`);
    console.log(`   URL: ${source.liveUrl || 'N/A'}`);
    console.log(`   Mode: ${source.mode || 'openapi'}`);
    console.log(`   Enabled: ${source.enabled ? '✅' : '❌'}`);
    
    if (source.products && source.products.length > 0) {
      console.log(`   Products: ${source.products.length}`);
      source.products.forEach(p => {
        console.log(`     - ${p.name} (${p.slug})`);
      });
    }
    console.log('');
  });
}

function listProducts() {
  const products = externalApiSourceService.getProducts();
  
  console.log('\n=== All Products ===\n');
  
  const byCategory = {};
  products.forEach(p => {
    if (!byCategory[p.category]) {
      byCategory[p.category] = [];
    }
    byCategory[p.category].push(p);
  });
  
  Object.keys(byCategory).forEach(category => {
    console.log(`\n📁 ${category}`);
    byCategory[category].forEach(p => {
      const featured = p.featured ? '⭐' : '  ';
      const visibility = p.visibility === 'private' ? '🔒' : '🌐';
      console.log(`   ${featured} ${visibility} ${p.name} (${p.slug})`);
      console.log(`      Gateway: ${p.gatewayUrl}${p.pathPrefix}`);
      if (p.parentSlug) {
        console.log(`      Parent: ${p.parentSlug}`);
      }
    });
  });
  console.log('');
}

function validateAll() {
  console.log('\n=== Validating All Sources ===\n');
  
  const validation = externalApiSourceService.validateAllSources();
  
  console.log(`✅ Valid configurations: ${validation.valid}`);
  console.log(`❌ Invalid configurations: ${validation.invalid}\n`);
  
  if (validation.errors.length > 0) {
    console.log('Validation Errors:');
    validation.errors.forEach(err => {
      console.log(`\n❌ ${err.name} (${err.slug})`);
      if (err.parentSlug) {
        console.log(`   Parent: ${err.parentSlug}`);
      }
      err.errors.forEach(e => {
        console.log(`   - ${e}`);
      });
    });
  } else {
    console.log('🎉 All configurations are valid!');
  }
  console.log('');
}

function showSummary() {
  console.log('\n=== Configuration Summary ===\n');
  
  const summary = externalApiSourceService.getSummary();
  
  console.log(`Total Sources: ${summary.totalSources}`);
  console.log(`Enabled Sources: ${summary.enabledSources}`);
  console.log(`Total Products: ${summary.totalProducts}`);
  console.log(`  - Public: ${summary.publicProducts}`);
  console.log(`  - Private: ${summary.privateProducts}`);
  console.log(`  - Featured: ${summary.featuredProducts}`);
  console.log(`\nDocumentation Modes:`);
  console.log(`  - OpenAPI: ${summary.modes.openapi}`);
  console.log(`  - Markdown: ${summary.modes.markdown}`);
  console.log(`\nCategories: ${summary.categories.join(', ')}`);
  console.log('');
}

function showSource(slug) {
  if (!slug) {
    console.error('❌ Please provide a slug: node apiSourcesCli.js show <slug>');
    process.exit(1);
  }
  
  const source = externalApiSourceService.getSource(slug);
  
  if (!source) {
    console.error(`❌ Source not found: ${slug}`);
    process.exit(1);
  }
  
  console.log('\n=== Source Details ===\n');
  console.log(formatJson(source));
  console.log('');
}

function showHelp() {
  console.log(`
External API Sources Configuration CLI

Usage:
  node apiSourcesCli.js <command> [args]

Commands:
  list              List all configured sources
  products          List all products (including slices)
  validate          Validate all configurations
  summary           Show configuration summary
  show <slug>       Show details for a specific source
  help              Show this help message

Examples:
  node apiSourcesCli.js list
  node apiSourcesCli.js products
  node apiSourcesCli.js validate
  node apiSourcesCli.js summary
  node apiSourcesCli.js show weather-api
  `);
}

// Command router
switch (command) {
  case 'list':
    listSources();
    break;
  case 'products':
    listProducts();
    break;
  case 'validate':
    validateAll();
    break;
  case 'summary':
    showSummary();
    break;
  case 'show':
    showSource(arg);
    break;
  case 'help':
  default:
    showHelp();
    break;
}
