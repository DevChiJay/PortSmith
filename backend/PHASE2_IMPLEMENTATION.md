# Phase 2 & 2a Implementation: Spec Fetching & Monorepo Slicing

## Overview

Phase 2 implements OpenAPI spec fetching from external FastAPI services with authentication, timeouts, and fallback support. Phase 2a adds monorepo slicing capability to create multiple API products from a single OpenAPI spec.

## Features Implemented

### ✅ Phase 2: Spec Fetching
- HTTP fetching with configurable timeout (30s)
- Authentication support (header, query, basic auth)
- Fallback to local spec files
- Hybrid mode (try live, fall back to file)
- Spec caching to disk
- Change detection via SHA256 hashing
- OpenAPI validation
- Comprehensive error handling and logging

### ✅ Phase 2a: Monorepo Slicing
- Single fetch, multiple products
- Filter by FastAPI tags
- Filter by path prefixes
- Preserve OpenAPI structure and components
- Automatic subset spec generation
- Independent caching per product

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Spec Sync Orchestrator                     │
│                 (specSyncService.js)                        │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
    ┌──────▼────────┐                  ┌──────▼────────┐
    │ Spec Fetcher  │                  │ Spec Subsetter│
    │   Service     │                  │   Service     │
    └──────┬────────┘                  └──────┬────────┘
           │                                  │
    ┌──────▼─────────────────────────────────▼─────────┐
    │           Specs Cache Directory                  │
    │   (specs-cache/*.json)                           │
    └──────────────────────────────────────────────────┘
```

## Files Created

### Services

1. **`src/services/specFetcherService.js`** - HTTP fetching, validation, caching
   - `fetchLiveSpec(source)` - Fetch from live URL
   - `loadFallbackSpec(source)` - Load from fallback file
   - `fetchSpec(source, mode)` - Unified fetch with fallback
   - `cacheSpec(slug, spec)` - Save to disk cache
   - `calculateSpecHash(spec)` - SHA256 hash for change detection
   - `hasSpecChanged(slug, newSpec)` - Compare with cached version

2. **`src/services/specSubsetService.js`** - Monorepo slicing
   - `subsetSpec(rawSpec, sliceConfig)` - Create filtered subset
   - `getAllTags(spec)` - Extract all tags from spec
   - `getAllPathPrefixes(spec)` - Get path prefixes
   - `getSpecStats(spec)` - Generate statistics

3. **`src/services/specSyncService.js`** - Orchestration
   - `syncSource(slug, mode)` - Sync single source
   - `syncMonorepoSource(parentSlug, mode)` - Sync monorepo + products
   - `syncAll(mode)` - Sync all enabled sources
   - `getSourceStatus(slug)` - Get sync status

### Scripts

4. **`src/scripts/specSyncCli.js`** - CLI interface
   - `fetch <slug>` - Fetch from live URL
   - `sync <slug> [mode]` - Sync with fallback
   - `sync-all [mode]` - Sync all enabled
   - `status <slug>` - Show sync status
   - `stats <slug>` - Show spec statistics
   - `analyze <slug>` - Analyze spec structure
   - `test-fetch <url>` - Test URL fetch

### Configuration

5. **`specs-cache/`** - Cached specs directory
6. **`specs-examples/`** - Example specs for testing
   - `weather-api.json` - Single API example
   - `ai-services.json` - Monorepo example

## Usage

### NPM Scripts (Recommended)

```bash
# View API sources configuration
npm run api-sources summary
npm run api-sources list
npm run api-sources validate

# Sync all enabled sources (hybrid mode)
npm run spec-sync:all

# Sync all (live only)
npm run spec-sync:live

# Sync all (fallback only)
npm run spec-sync:fallback

# Custom sync commands
npm run spec-sync -- sync weather-api
npm run spec-sync -- analyze text-analysis
npm run spec-sync -- stats image-processing
```

### Direct CLI Usage

```bash
# Fetch from live URL
node src/scripts/specSyncCli.js fetch weather-api

# Sync with fallback support (hybrid mode)
node src/scripts/specSyncCli.js sync weather-api

# Sync in specific mode
node src/scripts/specSyncCli.js sync weather-api live
node src/scripts/specSyncCli.js sync weather-api fallback
node src/scripts/specSyncCli.js sync weather-api hybrid

# Sync monorepo source
node src/scripts/specSyncCli.js sync ai-services

# Sync all enabled sources
node src/scripts/specSyncCli.js sync-all
node src/scripts/specSyncCli.js sync-all live
node src/scripts/specSyncCli.js sync-all fallback

# Show status
node src/scripts/specSyncCli.js status weather-api

# Show statistics
node src/scripts/specSyncCli.js stats text-analysis

# Analyze spec structure
node src/scripts/specSyncCli.js analyze ai-services

# Test fetching from URL
node src/scripts/specSyncCli.js test-fetch https://api.example.com/openapi.json
```

## Sync Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `live` | Fetch from live URL only | Testing connectivity, forcing fresh fetch |
| `fallback` | Load from fallback file only | Offline development, testing transformations |
| `hybrid` | Try live first, fall back to file | Production sync, scheduled jobs |

## Monorepo Slicing

### Configuration

In `externalApiSources.js`:

```javascript
{
  name: 'AI Services Suite',
  slug: 'ai-services',
  liveUrl: 'https://ai.example.com',
  fetchOnce: true,  // REQUIRED for monorepo
  products: [
    {
      name: 'Text Analysis API',
      slug: 'text-analysis',
      pathPrefix: '/gateway/text-analysis',
      // Filter by tags
      tags: ['text', 'nlp', 'sentiment']
    },
    {
      name: 'Image Processing API',
      slug: 'image-processing',
      pathPrefix: '/gateway/image-processing',
      // Filter by path prefixes
      pathPrefixes: ['/image', '/vision']
    }
  ]
}
```

### Filtering Logic

**Tag Filtering:**
- Include a path if ANY operation in that path has a matching tag
- Operations without matching tags are excluded

**Path Prefix Filtering:**
- Include a path if it starts with ANY configured prefix
- Example: `/image/classify` matches prefix `/image`

**Combined Filtering:**
- If both `tags` and `pathPrefixes` are provided, paths matching EITHER filter are included

### Example Output

Original spec: 6 paths, 6 operations
- Text Analysis (tags): 2 paths, 2 operations (`/text/analyze`, `/text/sentiment`)
- Image Processing (prefixes): 2 paths, 2 operations (`/image/classify`, `/image/detect`)
- Voice Recognition (tags): 2 paths, 2 operations (`/voice/transcribe`, `/voice/recognize`)

## Testing

### Enable Test Sources

Two example sources are enabled in the configuration:
1. **weather-api** - Single API example
2. **ai-services** - Monorepo with 3 products

### Test Workflow

```bash
# 1. Validate configuration
npm run api-sources validate

# 2. Sync test sources (fallback mode - uses example specs)
node src/scripts/specSyncCli.js sync weather-api fallback
node src/scripts/specSyncCli.js sync ai-services fallback

# 3. Verify cached specs
ls -la specs-cache/

# 4. Analyze results
node src/scripts/specSyncCli.js stats weather-api
node src/scripts/specSyncCli.js analyze text-analysis
node src/scripts/specSyncCli.js analyze image-processing

# 5. Check source status
node src/scripts/specSyncCli.js status weather-api
```

### Expected Results

After syncing:
- ✅ 5 cached specs created
  - `weather-api.json` (2 paths)
  - `ai-services.json` (6 paths - parent)
  - `text-analysis.json` (2 paths - subset)
  - `image-processing.json` (2 paths - subset)
  - `voice-recognition.json` (2 paths - subset)

## Error Handling

### Network Errors
- Connection timeout → falls back to cached/fallback spec
- DNS resolution failure → falls back
- HTTP errors (4xx, 5xx) → falls back

### Validation Errors
- Invalid JSON → error logged, no cache update
- Missing `openapi` or `swagger` field → rejected
- Missing `info` or `paths` → rejected

### File Errors
- Fallback file not found → error logged
- Invalid JSON in fallback → error logged
- Permission errors → error logged

## Change Detection

Specs are hashed (SHA256) to detect changes:
- If hash matches cached spec → "No change" logged
- If hash differs → Cache updated, "Changed" logged
- First sync → Always considered changed

Benefits:
- Avoid unnecessary database updates
- Track spec versions over time
- Trigger re-transformation only when needed

## Caching Strategy

### Disk Cache (`specs-cache/`)
- Persistent storage
- Survives server restarts
- Used for fallback and change detection
- Gitignored (not committed to repo)

### Future: Database Cache
- Store in MongoDB `ApiCatalog.specData`
- Served to frontend
- Includes transformed specs (Phase 3)

## Performance

### Optimization
- Single fetch per monorepo (not per product)
- Parallel product slicing (in-memory)
- Cached specs avoid repeated fetches
- 30s timeout prevents hanging

### Metrics
- Fetch time: ~100-500ms (live)
- Subset creation: <10ms per product
- Cache write: <50ms per spec

## Security

### API Keys
- Stored in environment variables
- Never logged or exposed
- Passed via headers (configurable)

### Validation
- Only valid OpenAPI specs are cached
- No arbitrary code execution
- Server-side only (no CORS issues)

## Next Steps: Phase 3

Phase 3 will add:
1. **Spec Transformation** - Add gateway routing, security schemes, metadata
2. **Database Persistence** - Store transformed specs in MongoDB
3. **Endpoint Derivation** - Extract endpoints from OpenAPI paths
4. **Frontend Integration** - Serve specs to Swagger/ReDoc viewer

## Troubleshooting

### "No cached spec found"
- Run `sync` command first to fetch and cache

### "Source not found"
- Check slug matches configuration in `externalApiSources.js`

### "Validation failed"
- Check if spec has required fields (`openapi`, `info`, `paths`)
- Verify JSON syntax is valid

### "Fetch timeout"
- Increase timeout in `specFetcherService.js`
- Use fallback mode for offline development

### Monorepo not slicing correctly
- Verify `fetchOnce: true` is set
- Check tags exist in operations
- Verify path prefixes match paths in spec
- Run `analyze` command to see available tags/prefixes

## Logs

All operations are logged with timestamps:
- `[INFO]` - Normal operations
- `[WARN]` - Fallback usage, unchanged specs
- `[ERROR]` - Failures, validation errors
- `[DEBUG]` - Cache misses, detailed operations

View logs in console output during sync operations.
