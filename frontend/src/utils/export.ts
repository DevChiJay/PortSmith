/**
 * Export utility functions for CSV and JSON data generation
 * Used across dashboard pages for data export features
 */

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: Array<{ key: keyof T; label: string }>
): string {
  if (data.length === 0) return '';

  // Use provided columns or infer from first object
  const headers = columns
    ? columns.map((col) => col.label)
    : Object.keys(data[0]);

  const keys = columns
    ? columns.map((col) => col.key as string)
    : Object.keys(data[0]);

  // Build CSV header row
  const csvHeader = headers.join(',');

  // Build CSV data rows
  const csvRows = data.map((row) => {
    return keys
      .map((key) => {
        let value = row[key];

        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        }

        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

        // Escape quotes and wrap in quotes if contains comma or quotes
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value}"`;
        }

        return value;
      })
      .join(',');
  });

  return [csvHeader, ...csvRows].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: Array<{ key: keyof T; label: string }>
): void {
  const csv = convertToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Download data as JSON file
 */
export function downloadJSON<T>(data: T, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format data for export with date transformation
 */
export function formatDataForExport<T extends Record<string, any>>(
  data: T[],
  dateFields: Array<keyof T> = []
): T[] {
  return data.map((item) => {
    const formatted = { ...item };

    // Format date fields
    dateFields.forEach((field) => {
      if (formatted[field]) {
        const date = new Date(formatted[field]);
        formatted[field] = date.toISOString() as any;
      }
    });

    return formatted;
  });
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(
  prefix: string,
  extension: 'csv' | 'json' = 'csv'
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Export API keys to CSV
 */
export function exportApiKeys(keys: any[]): void {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'apiName', label: 'API' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'expiresAt', label: 'Expires At' },
    { key: 'lastUsed', label: 'Last Used' },
  ];

  const formatted = formatDataForExport(keys, ['createdAt', 'expiresAt', 'lastUsed']);
  const filename = generateExportFilename('api-keys');
  downloadCSV(formatted, filename, columns);
}

/**
 * Export users to CSV
 */
export function exportUsers(users: any[]): void {
  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'apiKeyCount', label: 'API Keys' },
    { key: 'totalRequests', label: 'Total Requests' },
    { key: 'createdAt', label: 'Joined' },
    { key: 'lastActive', label: 'Last Active' },
  ];

  const formatted = formatDataForExport(users, ['createdAt', 'lastActive']);
  const filename = generateExportFilename('users');
  downloadCSV(formatted, filename, columns);
}

/**
 * Export analytics data to CSV
 */
export function exportAnalytics(
  data: any,
  type: 'overview' | 'usage' | 'apis'
): void {
  let filename = '';
  let exportData: any[] = [];

  switch (type) {
    case 'overview':
      filename = generateExportFilename('analytics-overview');
      exportData = [data]; // Single row for overview
      break;
    case 'usage':
      filename = generateExportFilename('analytics-usage');
      exportData = data.timeline || [];
      break;
    case 'apis':
      filename = generateExportFilename('analytics-apis');
      exportData = data.apis || [];
      break;
  }

  downloadCSV(exportData, filename);
}
