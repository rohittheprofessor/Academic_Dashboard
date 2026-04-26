import * as XLSX from 'xlsx';

// Helper to normalize strings (remove spaces, lowercase)
const normalize = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Aliases for common column headers
const COLUMN_ALIASES = {
  rollNo: ['rollno', 'rollnumber', 'id', 'studentid', 'studentno', 'regno'],
  name: ['name', 'studentname', 'fullname', 'student'],
  subject: ['subject', 'course', 'subjectname', 'coursename'],
  sessional: ['sessional', 'sessionalmarks', 'midterm', 'internal', 'sessionalexam'],
  final: ['final', 'finalmarks', 'finalexam', 'external', 'endsem', 'endterm'],
  total: ['total', 'totalmarks', 'totalscore'],
  percentage: ['percentage', 'perc', 'pct', '%'],
  grade: ['grade', 'lettergrade', 'result']
};

export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Assume first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array of objects
        const rawJson = XLSX.utils.sheet_to_json(worksheet);
        
        if (rawJson.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        // Map columns smartly
        const processedData = rawJson.map((row, index) => {
          let mappedRow = { _id: `row_${index}` };
          const keys = Object.keys(row);
          
          keys.forEach(key => {
            const normKey = normalize(key);
            let matched = false;

            for (const [standardKey, aliases] of Object.entries(COLUMN_ALIASES)) {
              if (normKey === standardKey || aliases.includes(normKey)) {
                mappedRow[standardKey] = row[key];
                matched = true;
                break;
              }
            }
            
            // If it doesn't match standard keys but has a value, keep it with original name
            if (!matched) {
              mappedRow[key] = row[key];
            }
          });

          // Compute derived values if missing
          if (!mappedRow.total && mappedRow.sessional !== undefined && mappedRow.final !== undefined) {
            mappedRow.total = Number(mappedRow.sessional) + Number(mappedRow.final);
          }
          if (!mappedRow.percentage && mappedRow.total !== undefined) {
             // Assuming total max is 100 for now, though it depends on subject.
             // We can just set it as a raw number if we don't know the max, but let's assume out of 100
             // or maybe sessional out of 30, final out of 70.
             mappedRow.percentage = mappedRow.total; 
          }
          if (!mappedRow.grade && mappedRow.percentage !== undefined) {
             mappedRow.grade = calculateGrade(mappedRow.percentage);
          }
          
          return mappedRow;
        });

        resolve(processedData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsBinaryString(file);
  });
};

const calculateGrade = (perc) => {
  if (perc >= 90) return 'O';
  if (perc >= 80) return 'A+';
  if (perc >= 70) return 'A';
  if (perc >= 60) return 'B+';
  if (perc >= 50) return 'B';
  if (perc >= 40) return 'C';
  return 'F';
};
