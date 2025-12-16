
import { InterviewRecord } from '../types';

export class ExportService {
  static downloadFile(content: string, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  static exportToJSON(records: InterviewRecord[]) {
    const data = JSON.stringify(records, null, 2);
    this.downloadFile(data, `interview-tracker-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  }

  static exportToCSV(records: InterviewRecord[]) {
    const headers = 'ID,Company,Position,Status,AppliedDate,UpdatedDate,Priority\n';
    const rows = records.map(r => 
      `"${r.id}","${r.company.name}","${r.position.title}","${r.status}","${r.timeline.applied}","${r.timeline.updated}","${r.metadata.priority}"`
    ).join('\n');
    this.downloadFile(headers + rows, `interviews-report-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  static async importFromJSON(file: File): Promise<InterviewRecord[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (Array.isArray(data)) {
            resolve(data);
          } else {
            reject(new Error('Invalid data format: Expected an array of records.'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsText(file);
    });
  }
}
