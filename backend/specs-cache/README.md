# OpenAPI Specs Cache

This directory stores cached OpenAPI specifications fetched from external APIs.

## Purpose

- **Fallback**: Used when live spec fetch fails
- **Change Detection**: Compare new specs with cached versions to detect updates
- **Performance**: Reduce unnecessary network calls
- **Development**: Work offline with cached specs

## Structure

Each cached spec is stored as:
```
<api-slug>.json
```

Example:
```
weather-api.json
text-analysis.json
image-processing.json
```

## Auto-generated

Files in this directory are automatically created and updated by the spec sync service.

## Git Ignore

This directory is typically excluded from version control (add to `.gitignore`):
```
specs-cache/*.json
```

However, you may choose to commit fallback specs for critical APIs.
