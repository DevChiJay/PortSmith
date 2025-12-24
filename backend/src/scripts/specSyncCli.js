#!/usr/bin/env node

/**
 * Spec Sync CLI
 * 
 * Commands for fetching, syncing, and managing OpenAPI specs
 * 
 * Usage:
 *   node specSyncCli.js fetch <slug>           - Fetch spec for a specific source
 *   node specSyncCli.js sync [slug]            - Sync source(s) (hybrid mode)
 *   node specSyncCli.js sync-all [mode]        - Sync all enabled sources
 *   node specSyncCli.js status <slug>          - Show sync status for a source
 *   node specSyncCli.js stats <slug>           - Show spec statistics
 *   node specSyncCli.js analyze <slug>         - Analyze spec (tags, paths, etc.)
 *   node specSyncCli.js test-fetch <url>       - Test fetching from a URL
 */

require('dotenv').config();
const specSyncService = require('../services/specSyncService');
const specFetcherService = require('../services/specFetcherService');
const specSubsetService = require('../services/specSubsetService');
const externalApiSourceService = require('../services/externalApiSourceService');

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function printSeparator() {
  console.log('\n' + '='.repeat(60) + '\n');
}

async function fetchSource(slug) {
  if (!slug) {
    console.error('❌ Please provide a slug: node specSyncCli.js fetch <slug>');
    process.exit(1);
  }

  console.log(`\n🔄 Fetching spec for ${slug}...\n`);

  const result = await specSyncService.syncSource(slug, 'live');

  if (result.success) {
    console.log(`✅ Successfully fetched spec for ${slug}`);
    console.log(`   Source: ${result.source}`);
    console.log(`   Changed: ${result.hasChanged ? 'Yes' : 'No'}`);
    console.log(`   Hash: ${result.specHash}`);
    
    if (result.stats) {
      console.log(`\n   Stats:`);
      console.log(`   - Title: ${result.stats.title}`);
      console.log(`   - Version: ${result.stats.version}`);
      console.log(`   - Paths: ${result.stats.pathCount}`);
      console.log(`   - Operations: ${result.stats.operationCount}`);
      console.log(`   - Tags: ${result.stats.tagCount}`);
    }
  } else {
    console.error(`❌ Failed to fetch spec for ${slug}`);
    console.error(`   Error: ${result.error}`);
    process.exit(1);
  }

  printSeparator();
}

async function syncSource(slug, mode = 'hybrid') {
  if (!slug) {
    console.error('❌ Please provide a slug: node specSyncCli.js sync <slug> [mode]');
    process.exit(1);
  }

  console.log(`\n🔄 Syncing ${slug} in ${mode} mode...\n`);

  const source = externalApiSourceService.getSource(slug);
  
  if (!source) {
    console.error(`❌ Source not found: ${slug}`);
    process.exit(1);
  }

  let result;

  // Check if monorepo
  if (source.fetchOnce && source.products) {
    result = await specSyncService.syncMonorepoSource(slug, mode);
    
    if (result.success) {
      console.log(`✅ Successfully synced monorepo: ${slug}`);
      console.log(`   ${result.summary}`);
      
      console.log(`\n   Products:`);
      result.products.forEach(p => {
        const status = p.success ? '✅' : '❌';
        console.log(`   ${status} ${p.name} (${p.slug})`);
        
        if (p.success) {
          console.log(`      - Changed: ${p.hasChanged ? 'Yes' : 'No'}`);
          console.log(`      - Paths: ${p.stats?.pathCount || 0}`);
          console.log(`      - Operations: ${p.stats?.operationCount || 0}`);
        } else {
          console.log(`      - Error: ${p.error}`);
        }
      });
    } else {
      console.error(`❌ Failed to sync monorepo: ${slug}`);
      console.error(`   Error: ${result.error}`);
      process.exit(1);
    }
  } else {
    result = await specSyncService.syncSource(slug, mode);
    
    if (result.success) {
      console.log(`✅ Successfully synced: ${slug}`);
      console.log(`   Source: ${result.source}`);
      console.log(`   Changed: ${result.hasChanged ? 'Yes' : 'No'}`);
      console.log(`   Paths: ${result.stats?.pathCount || 0}`);
      console.log(`   Operations: ${result.stats?.operationCount || 0}`);
    } else {
      console.error(`❌ Failed to sync: ${slug}`);
      console.error(`   Error: ${result.error}`);
      process.exit(1);
    }
  }

  printSeparator();
}

async function syncAll(mode = 'hybrid') {
  console.log(`\n🚀 Syncing all enabled sources in ${mode} mode...\n`);

  const result = await specSyncService.syncAll(mode);

  console.log(`\n📊 Sync Summary:`);
  console.log(`   Total Sources: ${result.totalSources}`);
  console.log(`   Synced: ${result.synced}`);
  console.log(`   Failed: ${result.failed}`);
  console.log(`   Status: ${result.success ? '✅ Success' : '⚠️  Partial Failure'}`);

  if (result.results.length > 0) {
    console.log(`\n   Details:`);
    
    result.results.forEach(r => {
      if (r.products) {
        // Monorepo result
        console.log(`   📦 ${r.parentSlug} (monorepo)`);
        r.products.forEach(p => {
          const status = p.success ? '✅' : '❌';
          console.log(`      ${status} ${p.slug}`);
        });
      } else {
        // Single source result
        const status = r.success ? '✅' : '❌';
        console.log(`   ${status} ${r.slug}`);
      }
    });
  }

  printSeparator();
}

async function showStatus(slug) {
  if (!slug) {
    console.error('❌ Please provide a slug: node specSyncCli.js status <slug>');
    process.exit(1);
  }

  console.log(`\n📊 Status for ${slug}:\n`);

  const status = await specSyncService.getSourceStatus(slug);

  if (!status.found) {
    console.error(`❌ Source not found: ${slug}`);
    process.exit(1);
  }

  console.log(`Name: ${status.name}`);
  console.log(`Enabled: ${status.enabled ? '✅' : '❌'}`);
  console.log(`Mode: ${status.mode}`);
  console.log(`Live URL: ${status.liveUrl || 'N/A'}`);
  console.log(`Fallback File: ${status.fallbackSpecFile || 'N/A'}`);
  console.log(`\nCached Spec: ${status.hasCachedSpec ? '✅ Yes' : '❌ No'}`);
  
  if (status.hasCachedSpec) {
    console.log(`Hash: ${status.cachedSpecHash}`);
    
    if (status.cachedSpecStats) {
      console.log(`\nCached Spec Stats:`);
      console.log(`  Title: ${status.cachedSpecStats.title}`);
      console.log(`  Version: ${status.cachedSpecStats.version}`);
      console.log(`  Paths: ${status.cachedSpecStats.pathCount}`);
      console.log(`  Operations: ${status.cachedSpecStats.operationCount}`);
      console.log(`  Tags: ${status.cachedSpecStats.tagCount}`);
    }
  }

  printSeparator();
}

async function showStats(slug) {
  if (!slug) {
    console.error('❌ Please provide a slug: node specSyncCli.js stats <slug>');
    process.exit(1);
  }

  console.log(`\n📊 Statistics for ${slug}:\n`);

  const cachedSpec = await specFetcherService.loadCachedSpec(slug);

  if (!cachedSpec) {
    console.error(`❌ No cached spec found for ${slug}. Run sync first.`);
    process.exit(1);
  }

  const stats = specSubsetService.getSpecStats(cachedSpec);

  console.log(`Title: ${stats.title}`);
  console.log(`Version: ${stats.version}`);
  console.log(`Paths: ${stats.pathCount}`);
  console.log(`Operations: ${stats.operationCount}`);
  console.log(`\nMethods:`);
  
  for (const [method, count] of Object.entries(stats.methodCounts)) {
    console.log(`  ${method.toUpperCase()}: ${count}`);
  }

  console.log(`\nTags (${stats.tagCount}):`);
  stats.tags.forEach(tag => console.log(`  - ${tag}`));

  printSeparator();
}

async function analyzeSpec(slug) {
  if (!slug) {
    console.error('❌ Please provide a slug: node specSyncCli.js analyze <slug>');
    process.exit(1);
  }

  console.log(`\n🔍 Analyzing spec for ${slug}:\n`);

  const cachedSpec = await specFetcherService.loadCachedSpec(slug);

  if (!cachedSpec) {
    console.error(`❌ No cached spec found for ${slug}. Run sync first.`);
    process.exit(1);
  }

  const tags = specSubsetService.getAllTags(cachedSpec);
  const prefixes = specSubsetService.getAllPathPrefixes(cachedSpec);
  const stats = specSubsetService.getSpecStats(cachedSpec);

  console.log(`📝 ${stats.title} v${stats.version}`);
  console.log(`\nAvailable Tags (${tags.length}):`);
  tags.forEach(tag => console.log(`  - ${tag}`));

  console.log(`\nPath Prefixes (${prefixes.length}):`);
  prefixes.forEach(prefix => console.log(`  - ${prefix}`));

  console.log(`\nPaths (${stats.pathCount}):`);
  if (cachedSpec.paths) {
    for (const [path, pathItem] of Object.entries(cachedSpec.paths)) {
      const methods = Object.keys(pathItem).filter(k => 
        ['get', 'post', 'put', 'delete', 'patch'].includes(k)
      );
      console.log(`  ${path}`);
      console.log(`    Methods: ${methods.join(', ').toUpperCase()}`);
    }
  }

  printSeparator();
}

async function testFetch(url) {
  if (!url) {
    console.error('❌ Please provide a URL: node specSyncCli.js test-fetch <url>');
    process.exit(1);
  }

  console.log(`\n🧪 Testing fetch from ${url}...\n`);

  try {
    const axios = require('axios');
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PortSmith-SpecFetcher/1.0'
      }
    });

    console.log(`✅ Success!`);
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);

    const spec = response.data;
    const stats = specSubsetService.getSpecStats(spec);

    console.log(`\nSpec Info:`);
    console.log(`  Title: ${stats.title}`);
    console.log(`  Version: ${stats.version}`);
    console.log(`  Paths: ${stats.pathCount}`);
    console.log(`  Operations: ${stats.operationCount}`);
    console.log(`  Tags: ${stats.tagCount}`);

  } catch (error) {
    console.error(`❌ Failed to fetch from ${url}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  printSeparator();
}

function showHelp() {
  console.log(`
Spec Sync CLI - OpenAPI Specification Management

Usage:
  node specSyncCli.js <command> [args]

Commands:
  fetch <slug>              Fetch spec from live URL for a specific source
  sync <slug> [mode]        Sync a specific source (default: hybrid mode)
  sync-all [mode]           Sync all enabled sources (default: hybrid mode)
  status <slug>             Show sync status for a source
  stats <slug>              Show statistics for cached spec
  analyze <slug>            Analyze spec (tags, paths, operations)
  test-fetch <url>          Test fetching from a URL
  help                      Show this help message

Sync Modes:
  live                      Fetch from live URL only
  fallback                  Load from fallback file only
  hybrid                    Try live first, fall back to file (default)

Examples:
  # Fetch from live URL
  node specSyncCli.js fetch weather-api

  # Sync a source (hybrid mode)
  node specSyncCli.js sync weather-api

  # Sync in fallback-only mode
  node specSyncCli.js sync weather-api fallback

  # Sync all enabled sources
  node specSyncCli.js sync-all

  # Show status
  node specSyncCli.js status weather-api

  # Analyze a spec
  node specSyncCli.js analyze ai-services

  # Test fetch from URL
  node specSyncCli.js test-fetch https://api.example.com/openapi.json
  `);
}

// Command router
(async () => {
  try {
    switch (command) {
      case 'fetch':
        await fetchSource(arg1);
        break;
      
      case 'sync':
        await syncSource(arg1, arg2 || 'hybrid');
        break;
      
      case 'sync-all':
        await syncAll(arg1 || 'hybrid');
        break;
      
      case 'status':
        await showStatus(arg1);
        break;
      
      case 'stats':
        await showStats(arg1);
        break;
      
      case 'analyze':
        await analyzeSpec(arg1);
        break;
      
      case 'test-fetch':
        await testFetch(arg1);
        break;
      
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
