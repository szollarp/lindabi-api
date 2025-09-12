# Tender Number Cleanup Scripts

This directory contains scripts to help clean up duplicate tender numbers and test the cleanup functionality.

## Scripts

### `cleanup-tender-duplicates.js`

Main cleanup script that:
- Finds all duplicate tender numbers in the database
- Generates proper tender numbers using the same logic as production
- Updates duplicate tenders with valid, sequential numbers
- Verifies that no duplicates remain

**Usage:**
```bash
cd api
node scripts/cleanup-tender-duplicates.js
```

**Features:**
- Uses atomic sequence generation to prevent race conditions
- Generates proper tender numbers (e.g., `ABC-2024-123`) instead of "dup" suffixed ones
- Includes safety checks to prevent new duplicates during cleanup
- Retry mechanism for edge cases
- Comprehensive logging and verification

### `test-cleanup.js`

Test script that:
- Creates test duplicate tender numbers
- Allows you to test the cleanup functionality
- Verifies the cleanup results

**Usage:**
```bash
cd api
node scripts/test-cleanup.js
```

**Note:** This script creates test data and should only be run in development environments.

### `config.json`

Database configuration file for the scripts. Update this with your database connection details.

## Prerequisites

1. **Database Access**: Ensure you have access to the database with appropriate permissions
2. **Node.js**: Make sure Node.js is installed
3. **Dependencies**: Install project dependencies with `npm install`

## Configuration

Update `config.json` with your database connection details:

```json
{
  "username": "your_username",
  "password": "your_password",
  "database": "your_database",
  "host": "your_host",
  "port": 3306,
  "dialect": "mysql",
  "dialectOptions": {},
  "ssl": false
}
```

## Migration Process

1. **Backup your database** (recommended)
2. **Run the cleanup script** to fix existing duplicates:
   ```bash
   node scripts/cleanup-tender-duplicates.js
   ```
3. **Apply the database migration** to add unique constraints:
   ```bash
   npm run migrate
   ```
4. **Verify the results** by checking that no duplicates remain

## Safety Features

- **Dry Run Capability**: The script can be run in dry-run mode (currently commented out)
- **Verification**: Automatically verifies that no duplicates remain after cleanup
- **Error Handling**: Comprehensive error handling and logging
- **Atomic Operations**: Uses database transactions to ensure data consistency

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure the database configuration is correct
2. **Permissions**: Make sure the database user has UPDATE permissions on the tenders table
3. **Missing Data**: Ensure contractors have valid `offer_num` values

### Logs

The scripts provide detailed logging:
- `🔍` Information messages
- `✅` Success messages  
- `⚠️` Warning messages
- `❌` Error messages

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify database connectivity and permissions
3. Ensure all required data (contractors, etc.) exists
4. Check the main documentation in `api/docs/TENDER_NUMBER_DUPLICATION_FIX.md`
