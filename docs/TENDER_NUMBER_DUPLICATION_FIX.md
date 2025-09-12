# Tender Number Duplication Fix

## Problem

The tender number generation system was experiencing frequent duplications due to race conditions in the sequence generation process. Multiple concurrent requests could obtain the same sequence number, leading to duplicate tender numbers.

## Root Causes

1. **Race Condition in `nextTenderSeq`**: The original implementation used separate INSERT and UPDATE queries, creating a window where concurrent requests could get the same sequence number.

2. **No Unique Constraint**: The `tenders.number` field had no database-level unique constraint, allowing duplicates to be inserted.

3. **No Retry Mechanism**: If a duplicate number was generated, there was no retry logic to generate a new one.

4. **Transaction Isolation Issues**: The sequence increment and retrieval happened in separate queries, creating opportunities for race conditions.

## Solution

### 1. Atomic Sequence Generation

**Before:**
```sql
-- Two separate queries (race condition prone)
INSERT INTO tender_number_counters ... ON CONFLICT DO NOTHING;
UPDATE tender_number_counters SET seq = seq + 1 ...;
SELECT seq FROM tender_number_counters ...;
```

**After:**
```sql
-- Single atomic query with RETURNING clause
INSERT INTO tender_number_counters (tenant_id, contractor_id, year, seq)
VALUES (:tenantId, :contractorId, :year, 1)
ON CONFLICT (tenant_id, contractor_id, year) 
DO UPDATE SET 
  seq = tender_number_counters.seq + 1,
  updated_at = NOW()
RETURNING seq
```

### 2. Retry Mechanism with Duplicate Checking

Added a retry mechanism that:
- Generates a sequence number
- Checks if the resulting tender number already exists
- Retries up to 3 times if duplicates are found
- Logs warnings for debugging

### 3. Database-Level Unique Constraint

Added a unique constraint on `(tenant_id, number)` to prevent duplicates at the database level:

```sql
ALTER TABLE tenders 
ADD CONSTRAINT tenders_tenant_id_number_unique 
UNIQUE (tenant_id, number) 
WHERE number IS NOT NULL;
```

### 4. Graceful Error Handling

Added proper error handling for unique constraint violations in the update process.

### 5. Cleanup Utilities

Created utility functions to:
- Find existing duplicate tender numbers
- Clean up duplicates by generating proper tender numbers using the same logic as production
- Get statistics about tender number usage

**Improved Cleanup Approach:**
- Uses the same atomic sequence generation logic as the production system
- Generates proper tender numbers (e.g., `ABC-2024-123`) instead of "dup" suffixed ones
- Includes safety checks to prevent new duplicates during cleanup
- Retry mechanism for edge cases

## Files Modified

### Core Changes
- `api/src/services/tender.ts` - Updated sequence generation and added retry logic
- `api/migrations/20250120000000000000-add-unique-constraint-tender-number.js` - Added unique constraint

### New Utilities
- `api/src/helpers/tender-duplicate-cleanup.ts` - Cleanup utilities
- `api/scripts/cleanup-tender-duplicates.js` - Migration script

## Migration Process

### 1. Clean Up Existing Duplicates

Before applying the unique constraint, run the cleanup script:

```bash
cd api
node scripts/cleanup-tender-duplicates.js
```

**Note:** The cleanup script now generates proper tender numbers using the same logic as the production system, ensuring that duplicate tenders get valid, sequential tender numbers instead of "dup" suffixed ones.

### 2. Apply Database Migration

```bash
npm run migrate
```

### 3. Verify the Fix

The new system will:
- Generate unique sequence numbers atomically
- Retry on duplicates
- Prevent duplicates at the database level
- Log warnings for debugging

## Testing

### Manual Testing
1. Create multiple tenders simultaneously
2. Update tender statuses to trigger number generation
3. Verify no duplicates are created

### Automated Testing
The retry mechanism includes logging that can be monitored:
- Warning logs when duplicates are detected and retried
- Error logs if retry attempts are exhausted

## Monitoring

### Key Metrics to Monitor
- Number of retry attempts (should be minimal)
- Unique constraint violations (should be zero)
- Tender number generation success rate

### Log Messages
- `Tender number {number} already exists, retrying...` - Normal retry
- `Failed to generate unique tender number after 3 attempts` - Critical error
- `Tender number {number} already exists, skipping number assignment` - Graceful fallback

## Benefits

1. **Eliminates Race Conditions**: Atomic sequence generation prevents concurrent access issues
2. **Database-Level Protection**: Unique constraint prevents duplicates even if application logic fails
3. **Self-Healing**: Retry mechanism handles edge cases automatically
4. **Observability**: Comprehensive logging for monitoring and debugging
5. **Backward Compatibility**: Existing functionality remains unchanged
6. **Cleanup Tools**: Utilities to identify and fix existing duplicates

## Future Improvements

1. **Monitoring Dashboard**: Create a dashboard to track tender number generation metrics
2. **Alerting**: Set up alerts for retry attempts or constraint violations
3. **Performance Optimization**: Consider using database sequences for even better performance
4. **Audit Trail**: Enhanced logging for compliance and debugging
