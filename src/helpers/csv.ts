import { Task } from '../models/interfaces/task';
import { TaskColumn } from '../models/interfaces/task-column';
import { User } from '../models/interfaces/user';
import { Project } from '../models/interfaces/project';
import { Tender } from '../models/interfaces/tender';

export interface TaskExportData {
  tasks: Task[];
  columns: TaskColumn[];
}

export interface CSVExportOptions {
  includeComments?: boolean;
  includeAttachments?: boolean;
  dateFormat?: string;
  delimiter?: string;
}

function taskToCSVRow(task: Task, options: CSVExportOptions = {}): Record<string, string> {
  const {
    dateFormat = 'YYYY-MM-DD',
    includeComments = false,
    includeAttachments = false
  } = options;

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const formatArray = (items: any[], field: string): string => {
    if (!items || items.length === 0) return '';
    return items.map(item => item[field] || '').join('; ');
  };

  const formatUser = (users: User[] | undefined): string => {
    if (!users || users.length === 0) return '';
    return users.map(user => user.name || '').join('; ');
  };

  const row: Record<string, string> = {
    'ID': task.id?.toString() || '',
    'UID': task.uid || '',
    'Title': task.title || '',
    'Description': task.description || '',
    'Type': task.type || '',
    'Priority': task.priority || '',
    'Start Date': formatDate(task.startDate),
    'Due Date': formatDate(task.dueDate),
    'Column': task.column?.name || '',
    'Position': task.position?.toString() || '',
    'Project': task.project?.name || task.project?.shortName || '',
    'Tender': task.tender?.shortName || task.tender?.number || '',
    'Assignee(s)': formatUser(task.assignee),
    'Reporter': task.reporter?.name || '',
    'Created On': formatDate(task.createdOn),
    'Updated On': formatDate(task.updatedOn || undefined),
  };

  if (includeComments) {
    row['Comments'] = formatArray(task.comments || [], 'content');
  }

  if (includeAttachments) {
    row['Attachments'] = formatArray(task.attachments || [], 'name');
  }

  return row;
}

export function generateTasksCSV(data: TaskExportData, options: CSVExportOptions = {}): string {
  const { delimiter = ',' } = options;

  if (!data.tasks || data.tasks.length === 0) {
    return '';
  }

  const headers = Object.keys(taskToCSVRow(data.tasks[0], options));

  const csvRows: string[] = [];

  csvRows.push(headers.join(delimiter));

  data.tasks.forEach(task => {
    const row = taskToCSVRow(task, options);
    const values = headers.map(header => {
      const value = row[header] || '';
      if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(delimiter));
  });

  return csvRows.join('\n');
}

export function generateCSVFilename(prefix: string = 'tasks'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${prefix}-${timestamp}.csv`;
}

export function csvToBuffer(csvContent: string): Buffer {
  return Buffer.from(csvContent, 'utf-8');
}

export function getCSVMimeType(): string {
  return 'text/csv; charset=utf-8';
}
