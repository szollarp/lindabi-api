import { generateTasksCSV, generateCSVFilename, csvToBuffer, getCSVMimeType } from './csv';

const mockTasks = [
  {
    id: 1,
    uid: 'task-001',
    title: 'Implement User Authentication',
    description: 'Create login and registration system',
    type: 'task',
    priority: 'high',
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-01-15'),
    column: { name: 'In Progress' },
    position: 1,
    project: { name: 'Web Application', shortName: 'WA' },
    tender: { shortName: 'T001', number: 'T-2024-001' },
    assignee: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
    reporter: { name: 'Project Manager' },
    createdOn: new Date('2024-01-01'),
    updatedOn: new Date('2024-01-10'),
    comments: [
      { content: 'Started working on this', creator: { name: 'John Doe' } },
      { content: 'UI components completed', creator: { name: 'Jane Smith' } }
    ],
    attachments: [
      { name: 'design-mockup.pdf' },
      { name: 'api-specs.docx' }
    ]
  },
  {
    id: 2,
    uid: 'task-002',
    title: 'Fix Login Bug',
    description: 'Users cannot login with special characters',
    type: 'fix',
    priority: 'medium',
    startDate: new Date('2024-01-05'),
    dueDate: new Date('2024-01-12'),
    column: { name: 'Testing' },
    position: 2,
    project: { name: 'Web Application', shortName: 'WA' },
    tender: null,
    assignee: [{ name: 'John Doe' }],
    reporter: { name: 'QA Team' },
    createdOn: new Date('2024-01-05'),
    updatedOn: new Date('2024-01-08'),
    comments: [],
    attachments: []
  }
];

const mockColumns = [
  { id: 1, name: 'To Do', position: 1 },
  { id: 2, name: 'In Progress', position: 2 },
  { id: 3, name: 'Testing', position: 3 },
  { id: 4, name: 'Done', position: 4 }
];

describe('CSV Export Functionality', () => {
  test('generateTasksCSV - basic export', () => {
    const exportData = { tasks: mockTasks, columns: mockColumns };
    const csvContent = generateTasksCSV(exportData);

    expect(csvContent).toBeTruthy();
    expect(csvContent).toContain('ID,UID,Title,Description,Type,Priority');
    expect(csvContent).toContain('Implement User Authentication');
    expect(csvContent).toContain('Fix Login Bug');
  });

  test('generateTasksCSV - with comments', () => {
    const exportData = { tasks: mockTasks, columns: mockColumns };
    const csvContent = generateTasksCSV(exportData, { includeComments: true });

    expect(csvContent).toContain('Comments');
    expect(csvContent).toContain('Started working on this');
    expect(csvContent).toContain('UI components completed');
  });

  test('generateTasksCSV - with attachments', () => {
    const exportData = { tasks: mockTasks, columns: mockColumns };
    const csvContent = generateTasksCSV(exportData, { includeAttachments: true });

    expect(csvContent).toContain('Attachments');
    expect(csvContent).toContain('design-mockup.pdf');
    expect(csvContent).toContain('api-specs.docx');
  });

  test('generateTasksCSV - custom delimiter', () => {
    const exportData = { tasks: mockTasks, columns: mockColumns };
    const csvContent = generateTasksCSV(exportData, { delimiter: ';' });

    expect(csvContent).toContain('ID;UID;Title;Description;Type;Priority');
  });

  test('generateTasksCSV - empty data', () => {
    const exportData = { tasks: [], columns: [] };
    const csvContent = generateTasksCSV(exportData);

    expect(csvContent).toBe('');
  });

  test('generateCSVFilename', () => {
    const filename = generateCSVFilename('tasks');

    expect(filename).toMatch(/^tasks-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  test('csvToBuffer', () => {
    const csvContent = 'ID,Title\n1,Test Task';
    const buffer = csvToBuffer(csvContent);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toBe(csvContent);
  });

  test('getCSVMimeType', () => {
    const mimeType = getCSVMimeType();

    expect(mimeType).toBe('text/csv; charset=utf-8');
  });

  test('CSV content structure', () => {
    const exportData = { tasks: mockTasks, columns: mockColumns };
    const csvContent = generateTasksCSV(exportData, { includeComments: true, includeAttachments: true });

    const lines = csvContent.split('\n');

    expect(lines[0]).toContain('ID,UID,Title,Description,Type,Priority,Start Date,Due Date,Column,Position,Project,Tender,Assignee(s),Reporter,Created On,Updated On,Comments,Attachments');

    expect(lines.length).toBe(3);

    expect(lines[1]).toContain('1,task-001,Implement User Authentication');
    expect(lines[1]).toContain('high,2024-01-01,2024-01-15,In Progress,1,Web Application,T-2024-001');

    expect(lines[2]).toContain('2,task-002,Fix Login Bug');
    expect(lines[2]).toContain('medium,2024-01-05,2024-01-12,Testing,2,Web Application,');
  });

  test('CSV escaping', () => {
    const taskWithSpecialChars = {
      ...mockTasks[0],
      title: 'Task with "quotes" and, commas',
      description: 'Description with\nnewlines'
    };

    const exportData = { tasks: [taskWithSpecialChars], columns: mockColumns };
    const csvContent = generateTasksCSV(exportData);

    expect(csvContent).toContain('"Task with ""quotes"" and, commas"');
    expect(csvContent).toContain('"Description with\nnewlines"');
  });
});

export const exampleUsage = `
const exportData = { tasks, columns };
const csvContent = generateTasksCSV(exportData, {
  includeComments: true,
  includeAttachments: true,
  delimiter: ','
});

const filename = generateCSVFilename('tasks');
const buffer = csvToBuffer(csvContent);
const mimeType = getCSVMimeType();

res.setHeader('Content-Type', mimeType);
res.setHeader('Content-Disposition', \`attachment; filename="\${filename}"\`);
res.send(buffer);
`;
