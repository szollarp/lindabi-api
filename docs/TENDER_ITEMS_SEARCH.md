# Tender Items Search Implementation

This document describes the implementation of the tender items search functionality, which provides fast, fuzzy search capabilities for tender items.

## Overview

The tender items search system consists of:

1. **tender_items_search table** - Optimized search table with denormalized data
2. **Database triggers** - Automatic synchronization with the items table
3. **Search API** - RESTful endpoints for searching items
4. **Backfill functionality** - Scripts to rebuild the search table

## Database Schema

### tender_items_search Table

```sql
CREATE TABLE tender_items_search (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  name VARCHAR NOT NULL,
  normalized_name VARCHAR NOT NULL,
  unit VARCHAR,
  default_price_net DECIMAL(10,2),
  currency VARCHAR(3),
  vat_rate DECIMAL(5,2),
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP,
  alias_names JSON DEFAULT '[]',
  tags JSON DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id)
);
```

### Indexes

- `idx_tender_items_search_tenant_active` - Composite index on (tenant_id, active)
- `idx_tender_items_search_usage` - Composite index on (usage_count, last_used_at)
- `idx_tender_items_search_normalized_name_trgm` - GIN index using pg_trgm for fuzzy search
- `idx_tender_items_search_alias_names_gin` - GIN index for JSON array search
- `idx_tender_items_search_tags_gin` - GIN index for JSON array search

## API Endpoints

### Search Items

```
GET /tender-items-search?query={search_term}&limit={number}&offset={number}
```

**Parameters:**
- `query` (required): Search term (minimum 2 characters)
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "itemId": 123,
    "name": "Item Name",
    "unit": "pcs",
    "defaultPriceNet": 100.00,
    "currency": "HUF",
    "vatRate": 27.0,
    "usageCount": 5,
    "lastUsedAt": "2025-01-28T10:00:00Z",
    "aliasNames": ["alias1", "alias2"],
    "tags": ["category1"],
    "similarity": 0.95,
    "rank": 1
  }
]
```

### Backfill Search Table

```
GET /tender-items-search/backfill
```

**Response:**
```json
{
  "processed": 1500,
  "errors": 0
}
```

## Search Features

### Text Normalization

Search terms and item names are normalized using:
- Lowercase conversion
- Diacritic removal (unaccent)
- Whitespace normalization

### Ranking Algorithm

Results are ranked by:
1. **Prefix matches** - Items starting with the search term
2. **Similarity score** - Fuzzy matching using pg_trgm
3. **Usage count** - Most frequently used items
4. **Last used date** - Recently used items
5. **Name** - Alphabetical order

### Search Scope

The search includes:
- Item names (normalized)
- Alias names (JSON array)
- Tags (JSON array)

## Synchronization

### Database Triggers

Automatic synchronization is handled by PostgreSQL triggers:

- **INSERT trigger** - Creates search record when item is created
- **UPDATE trigger** - Updates search record when item is modified
- **DELETE trigger** - Removes search record when item is deleted

### Application-Level Sync

The item service includes hooks to sync with the search table:
- `createItem()` - Syncs new items
- `updateItem()` - Syncs modified items
- `deleteItem()` - Removes deleted items
- `deleteItems()` - Removes multiple deleted items

## Backfill Process

### Manual Backfill

Run the backfill script to rebuild the entire search table:

```bash
npm run backfill:search
```

### API Backfill

Use the backfill endpoint for programmatic access:

```bash
curl -X GET "http://localhost:3000/tender-items-search/backfill" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Performance Considerations

### Database Optimization

- **GIN indexes** for fast JSON array searches
- **pg_trgm indexes** for fuzzy text matching
- **Composite indexes** for common query patterns
- **Normalized text** to reduce index size

### Query Optimization

- **Minimum query length** (2 characters) to prevent expensive queries
- **Pagination** support with limit/offset
- **Tenant isolation** for security and performance
- **Raw queries** for complex ranking logic

### Caching Strategy

Consider implementing:
- **Redis caching** for frequent searches
- **Query result caching** for common search terms
- **Usage statistics caching** for ranking

## Usage Statistics

The system tracks:
- **usage_count** - Number of times an item has been used
- **last_used_at** - Timestamp of last usage

These statistics are used for ranking and can be updated via the `updateUsageStats()` method.

## Error Handling

### Graceful Degradation

- Search failures don't affect item operations
- Sync failures are logged but don't block item changes
- Backfill process continues even if individual items fail

### Logging

- All sync operations are logged
- Search errors are logged with context
- Backfill progress is logged

## Security

### Tenant Isolation

- All searches are scoped to the user's tenant
- Search results only include items from the authenticated user's tenant
- No cross-tenant data leakage

### Authentication

- All endpoints require JWT authentication
- Tenant information is extracted from the JWT token
- No direct database access to search table

## Monitoring

### Key Metrics

- Search response times
- Sync operation success rates
- Search table size and growth
- Most searched terms
- Usage statistics accuracy

### Health Checks

- Search table synchronization status
- Database trigger functionality
- Index performance
- Extension availability (pg_trgm)

## Troubleshooting

### Common Issues

1. **Slow searches** - Check index usage and query plans
2. **Sync failures** - Check trigger logs and database constraints
3. **Missing results** - Run backfill to rebuild search table
4. **Performance degradation** - Monitor index statistics and rebuild if needed

### Maintenance

- **Regular backfill** - Rebuild search table periodically
- **Index maintenance** - Monitor and rebuild indexes as needed
- **Statistics updates** - Keep PostgreSQL statistics current
- **Log rotation** - Manage log files for sync operations
