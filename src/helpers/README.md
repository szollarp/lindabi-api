# CSV Export Helper

## Overview

The CSV export helper provides functionality to export task data in CSV format for easy analysis and reporting.

## Features

- **Task Export**: Export all tasks or filtered tasks to CSV
- **Configurable Options**: Include/exclude comments, attachments, custom date formats
- **Filtering Support**: Filter by column, priority, type, and assignee
- **Proper CSV Formatting**: Handles special characters, quotes, and delimiters
- **File Download Ready**: Returns buffer and proper MIME type for downloads

## Usage

### Basic CSV Export

```typescript
// Export all tasks
const result = await context.services.task.exportToCSV(context, user);

// Export with options
const result = await context.services.task.exportToCSV(context, user, {
  includeComments: true,
  includeAttachments: true,
  dateFormat: 'DD/MM/YYYY',
  delimiter: ';'
});
```

### Filtered CSV Export

```typescript
// Export tasks from specific column
const result = await context.services.task.exportToCSV(
  context, 
  user, 
  options, 
  { columnId: 1 }
);

// Export high priority tasks
const result = await context.services.task.exportToCSV(
  context, 
  user, 
  options, 
  { priority: 'high' }
);

// Export tasks assigned to specific user
const result = await context.services.task.exportToCSV(
  context, 
  user, 
  options, 
  { assigneeId: 123 }
);

// Combine multiple filters
const result = await context.services.task.exportToCSV(
  context, 
  user, 
  options, 
  { 
    columnId: 1, 
    priority: 'high', 
    type: 'task' 
  }
);
```

## API Endpoint

### GET /tasks/export/csv

Export tasks to CSV format with optional filtering.

**Query Parameters:**

- `includeComments` (boolean): Include task comments in export
- `includeAttachments` (boolean): Include attachment names in export
- `dateFormat` (string): Custom date format (default: YYYY-MM-DD)
- `delimiter` (string): CSV delimiter (default: ,)
- `columnId` (number): Filter by task column
- `priority` (string): Filter by priority (low, medium, high)
- `type` (string): Filter by task type (task, fix)
- `assigneeId` (number): Filter by assignee user ID

**Response:**

```typescript
{
  csvContent: string;      // Raw CSV content
  filename: string;        // Generated filename (e.g., "tasks-2024-01-15.csv")
  buffer: Buffer;          // CSV data as buffer for download
  mimeType: string;        // MIME type (text/csv; charset=utf-8)
  totalTasks: number;      // Number of tasks exported
  exportOptions: object;   // Applied export options
}
```

## CSV Columns

The exported CSV includes the following columns:

### Standard Columns
- **ID**: Task ID
- **UID**: Unique identifier
- **Title**: Task title
- **Description**: Task description
- **Type**: Task type (task/fix)
- **Priority**: Priority level (low/medium/high)
- **Start Date**: Task start date
- **Due Date**: Task due date
- **Column**: Task column name
- **Position**: Position within column
- **Project**: Associated project name
- **Tender**: Associated tender
- **Assignee(s)**: Assigned users (semicolon separated)
- **Reporter**: Task reporter
- **Created On**: Creation date
- **Updated On**: Last update date

### Optional Columns
- **Comments**: Task comments (if includeComments: true)
- **Attachments**: Attachment names (if includeAttachments: true)

## Example Frontend Usage

```typescript
// Download CSV file
const downloadCSV = async () => {
  try {
    const response = await fetch('/api/tasks/export/csv?includeComments=true&priority=high');
    const data = await response.json();
    
    // Create blob and download
    const blob = new Blob([data.buffer], { type: data.mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export CSV:', error);
  }
};
```

## Security

- **Authentication Required**: All export endpoints require valid authentication
- **Permission Based**: Users must have "Task:List" permission
- **Tenant Isolation**: Users can only export tasks from their own tenant
- **Data Validation**: All input parameters are validated and sanitized

## Performance Considerations

- **Efficient Queries**: Uses optimized database queries with proper includes
- **Memory Management**: Returns buffer instead of large strings for memory efficiency
- **Filtering**: Database-level filtering reduces data transfer
- **Pagination**: Consider implementing pagination for very large datasets

## Error Handling

The export function handles various error scenarios:

- **No Tasks**: Returns empty CSV with headers
- **Invalid Filters**: Gracefully handles invalid filter parameters
- **Database Errors**: Proper error propagation and logging
- **Memory Issues**: Buffer-based approach prevents memory overflow
