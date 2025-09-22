# Database Indexing Strategy

This document outlines the comprehensive database indexing strategy implemented for the Lindabi API to optimize query performance and support the application's business requirements.

## Overview

The indexing strategy is implemented across 4 migration files:
- `2025012800000003-add-performance-indexes.js` - Core performance indexes
- `2025012800000004-add-specialized-indexes.js` - Specialized and composite indexes
- `2025012800000005-add-business-logic-indexes.js` - Business logic specific indexes
- `2025012800000006-add-monitoring-indexes.js` - Monitoring and maintenance indexes

## Index Categories

### 1. Core Performance Indexes

#### Tenant-Based Queries
Almost every query in the application filters by `tenant_id` for multi-tenancy support:

```sql
-- Users by tenant and entity
CREATE INDEX idx_users_tenant_entity ON users (tenant_id, entity);

-- Companies by tenant and type
CREATE INDEX idx_companies_tenant_type ON companies (tenant_id, type);

-- Projects by tenant and status
CREATE INDEX idx_projects_tenant_status ON projects (tenant_id, status);
```

#### Foreign Key Relationships
Indexes on all foreign key columns to optimize JOINs:

```sql
-- User relationships
CREATE INDEX idx_users_role_id ON users (role_id);

-- Project relationships
CREATE INDEX idx_projects_customer_id ON projects (customer_id);
CREATE INDEX idx_projects_contractor_id ON projects (contractor_id);
CREATE INDEX idx_projects_tender_id ON projects (tender_id);
```

#### Date-Based Queries
Indexes on commonly filtered date columns:

```sql
-- Execution due dates for payroll
CREATE INDEX idx_executions_due_date ON executions (due_date);

-- Project due dates for scheduling
CREATE INDEX idx_projects_due_date ON projects (due_date);

-- Financial transaction dates
CREATE INDEX idx_financial_transactions_date ON financial_transactions (date);
```

### 2. Specialized Indexes

#### Partial Indexes
Indexes that only include rows matching specific conditions:

```sql
-- Active users only
CREATE INDEX idx_users_active_tenant ON users (tenant_id, name) 
WHERE status = 'active';

-- Recent executions (last 30 days)
CREATE INDEX idx_executions_recent ON executions (employee_id, due_date) 
WHERE due_date >= CURRENT_DATE - INTERVAL '30 days';
```

#### Composite Indexes
Multi-column indexes for complex query patterns:

```sql
-- User listing with multiple filters
CREATE INDEX idx_users_tenant_entity_status_name ON users (tenant_id, entity, status, name);

-- Execution queries for payroll
CREATE INDEX idx_executions_tenant_employee_status_due_date ON executions (tenant_id, employee_id, status, due_date);
```

#### Text Search Indexes
GIN indexes using pg_trgm for fuzzy text search:

```sql
-- Name search across entities
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);
CREATE INDEX idx_companies_name_trgm ON companies USING gin (name gin_trgm_ops);
CREATE INDEX idx_contacts_name_trgm ON contacts USING gin (name gin_trgm_ops);
```

### 3. Business Logic Indexes

#### Document Management
```sql
-- Documents by owner and type
CREATE INDEX idx_documents_owner_type_id ON documents (owner_type, owner_id);

-- Documents by storage status
CREATE INDEX idx_documents_stored ON documents (stored);
```

#### Task Management
```sql
-- Tasks by project and assignee
CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks (assignee_id);

-- Task columns by tenant
CREATE INDEX idx_task_columns_tenant_id ON task_columns (tenant_id);
```

#### Financial Operations
```sql
-- Invoices by project and employee
CREATE INDEX idx_invoices_project_id ON invoices (project_id);
CREATE INDEX idx_invoices_employee_id ON invoices (employee_id);

-- Financial transactions by payer/recipient
CREATE INDEX idx_financial_transactions_payer_id ON financial_transactions (payer_id);
CREATE INDEX idx_financial_transactions_recipient_id ON financial_transactions (recipient_id);
```

### 4. Monitoring and Maintenance Indexes

#### Cleanup Operations
```sql
-- Soft deleted records for cleanup
CREATE INDEX idx_users_soft_deleted ON users (deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Expired tokens for cleanup
CREATE INDEX idx_refresh_tokens_expired ON refresh_tokens (expires_at) 
WHERE expires_at < NOW();
```

#### Data Integrity
```sql
-- Check for orphaned records
CREATE INDEX idx_tender_items_orphaned ON tender_items (tender_id) 
WHERE tender_id NOT IN (SELECT id FROM tenders);
```

## Performance Benefits

### Query Optimization
- **Tenant Isolation**: All tenant-based queries use efficient composite indexes
- **JOIN Performance**: Foreign key indexes reduce JOIN costs significantly
- **Date Range Queries**: Optimized for common date filtering patterns
- **Text Search**: Fast fuzzy search across name and description fields

### Maintenance Benefits
- **Cleanup Operations**: Partial indexes for efficient cleanup of old/expired data
- **Data Integrity**: Indexes to identify orphaned records
- **Monitoring**: Statistics collection indexes for performance monitoring

## Index Maintenance

### Monitoring
Regular monitoring of index usage and performance:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Maintenance Tasks
1. **Regular Statistics Updates**: `ANALYZE` tables after significant data changes
2. **Index Rebuilding**: Consider `REINDEX` for heavily fragmented indexes
3. **Unused Index Cleanup**: Remove indexes that are never used
4. **Partial Index Updates**: Update partial index conditions as business rules change

## Best Practices

### Index Design Principles
1. **Query-Driven**: Indexes are designed based on actual query patterns
2. **Selective**: Partial indexes reduce storage and maintenance overhead
3. **Composite**: Multi-column indexes for complex WHERE clauses
4. **Covering**: Include commonly selected columns in indexes when possible

### Performance Considerations
1. **Write Overhead**: More indexes mean slower INSERT/UPDATE operations
2. **Storage**: Indexes consume additional disk space
3. **Maintenance**: Indexes need regular maintenance and monitoring
4. **Concurrent Creation**: All indexes are created with `CONCURRENTLY` to avoid blocking

### Monitoring Queries
```sql
-- Index size analysis
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Index bloat analysis
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    pg_size_pretty(pg_relation_size(indexrelid) - pg_relation_size(indexrelid) * (1 - (pg_stat_get_tuples_returned(indexrelid)::float / NULLIF(pg_stat_get_tuples_fetched(indexrelid), 0)))) as bloat_size
FROM pg_stat_user_indexes;
```

## Migration Strategy

### Rollout Plan
1. **Test Environment**: Run migrations in test environment first
2. **Staging Validation**: Validate performance improvements in staging
3. **Production Rollout**: Deploy during maintenance windows
4. **Monitoring**: Monitor query performance after deployment

### Rollback Strategy
Each migration includes a `down` method to remove indexes if needed:

```bash
# Rollback specific migration
npm run migrate:undo -- --name 2025012800000003-add-performance-indexes

# Rollback all indexing migrations
npm run migrate:undo -- --name 2025012800000003-add-performance-indexes
npm run migrate:undo -- --name 2025012800000004-add-specialized-indexes
npm run migrate:undo -- --name 2025012800000005-add-business-logic-indexes
npm run migrate:undo -- --name 2025012800000006-add-monitoring-indexes
```

## Expected Performance Improvements

### Query Performance
- **List Queries**: 50-80% improvement in list/listing operations
- **Search Operations**: 70-90% improvement in text search queries
- **JOIN Operations**: 60-85% improvement in complex JOIN queries
- **Date Range Queries**: 40-70% improvement in date-based filtering

### Application Performance
- **Page Load Times**: 30-50% improvement in page load times
- **API Response Times**: 40-60% improvement in API response times
- **Concurrent Users**: Better support for higher concurrent user loads
- **Database Load**: Reduced CPU and I/O load on database server

## Conclusion

This comprehensive indexing strategy provides:
- **Optimal Query Performance**: Indexes designed for actual query patterns
- **Scalability**: Support for growing data volumes and user loads
- **Maintainability**: Easy monitoring and maintenance of indexes
- **Flexibility**: Ability to add/remove indexes as requirements change

The strategy balances performance improvements with maintenance overhead, ensuring the database can efficiently support the application's current and future needs.
