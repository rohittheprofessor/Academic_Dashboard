import * as XLSX from 'xlsx';

/**
 * Parses an ERP Excel file and extracts Metadata + Student Data.
 * Handles messy headers, merged cells, and dynamic Q-wise columns.
 */
export const parseERPExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to array of arrays for easy row-by-row scanning
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        const metadata = {
          paperCode: '',
          course: '',
          program: '',
          semester: '',
          section: '',
          session: '',
          testName: 'Internal Assessment'
        };

        let tableStartRowIndex = -1;
        let questionColumns = []; // Array of { key: 'Q1', index: 5 }
        let headers = [];

        // 1. Scan for Metadata and Table Header Row
        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          const rowStr = row.join(' ').toLowerCase();

          // Try to extract metadata (very loose heuristics to handle messy ERPs)
          if (rowStr.includes('paper code')) metadata.paperCode = extractValueAfter(row, 'paper code');
          if (rowStr.includes('course')) metadata.course = extractValueAfter(row, 'course');
          if (rowStr.includes('semester')) metadata.semester = extractValueAfter(row, 'semester');
          if (rowStr.includes('section')) metadata.section = extractValueAfter(row, 'section');
          if (rowStr.includes('session')) metadata.session = extractValueAfter(row, 'session');

          // Detect start of table (look for common student headers)
          if (rowStr.includes('roll no') || rowStr.includes('student id')) {
            tableStartRowIndex = i;
            headers = row;
            break;
          }
        }

        if (tableStartRowIndex === -1) {
          throw new Error("Could not detect student table. Please ensure the Excel contains 'Roll No' or 'Student Id' columns.");
        }

        // 2. Identify Columns from Header (Scan up to 4 rows to catch multi-row headers)
        const colMap = {
          sNo: -1,
          studentId: -1,
          rollNo: -1,
          name: -1,
          total: -1,
          percentage: -1
        };

        for (let r = tableStartRowIndex; r < Math.min(rawRows.length, tableStartRowIndex + 4); r++) {
          const row = rawRows[r];
          if (!row) continue;
          
          row.forEach((cell, index) => {
            if (!cell) return;
            const h = String(cell).toLowerCase().trim();
            
            if (colMap.sNo === -1 && (h === 's. no.' || h === 's.no' || h === 'sno' || h === 'sr no' || h === 's. no')) colMap.sNo = index;
            else if (colMap.studentId === -1 && h.includes('student id')) colMap.studentId = index;
            else if (colMap.rollNo === -1 && (h.includes('roll no') || h.includes('rollno'))) colMap.rollNo = index;
            else if (colMap.name === -1 && h === 'name') colMap.name = index;
            else if (colMap.total === -1 && h === 'total') colMap.total = index;
            else if (colMap.percentage === -1 && (h.includes('%') || h.includes('percentage') || h.includes('per.'))) colMap.percentage = index;
            
            // Detect question columns (Q1, Q. 1, Question 1)
            else if (/^q\.?\s*\d+$/i.test(h) || /^question\s*\d+$/i.test(h)) {
               if (!questionColumns.find(q => q.index === index)) {
                 questionColumns.push({
                   key: String(cell).toUpperCase().replace(/\s|\./g, ''), // Normalizes 'Q. 1' to 'Q1'
                   originalKey: cell,
                   index: index
                 });
               }
            }
          });
        }

        // Try to auto-detect max marks row (a row before student data starts with numbers in Q columns)
        const maxMarksMap = {};
        for (let r = tableStartRowIndex + 1; r < Math.min(rawRows.length, tableStartRowIndex + 5); r++) {
           const row = rawRows[r];
           const rNo = String(row[colMap.rollNo] || '').trim();
           // If there is no roll number, it might be the Max Marks row
           if (!rNo || rNo.toLowerCase().includes('roll no')) {
             let hasMaxMarks = false;
             questionColumns.forEach(qCol => {
               if (row[qCol.index] && !isNaN(Number(row[qCol.index]))) {
                 maxMarksMap[qCol.key] = Number(row[qCol.index]);
                 hasMaxMarks = true;
               }
             });
             if (hasMaxMarks) break; // Found the max marks row
           }
        }

        // 3. Extract Student Records
        const studentRecords = [];
        for (let i = tableStartRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          
          // Stop if we hit an empty row or if it doesn't have a Roll No
          if (!row) continue;
          const rNo = String(row[colMap.rollNo] || '').trim();
          if (!rNo || rNo.toLowerCase().includes('roll no')) continue; // Skip header/max marks rows

          const record = {
            sNo: colMap.sNo !== -1 ? row[colMap.sNo] : studentRecords.length + 1,
            studentId: colMap.studentId !== -1 ? String(row[colMap.studentId]) : '',
            rollNo: String(row[colMap.rollNo]),
            name: colMap.name !== -1 ? String(row[colMap.name]) : 'Unknown',
            marks: {},
            totalMarks: colMap.total !== -1 ? Number(row[colMap.total]) : 0,
            percentage: colMap.percentage !== -1 ? Number(row[colMap.percentage]) : 0
          };

          // Extract question marks
          let calculatedTotal = 0;
          questionColumns.forEach(qCol => {
            const val = Number(row[qCol.index]) || 0;
            record.marks[qCol.key] = val;
            calculatedTotal += val;
          });

          // Fallback total calculation if not provided in ERP
          if (colMap.total === -1) {
            record.totalMarks = calculatedTotal;
          }

          studentRecords.push(record);
        }

        resolve({
          metadata,
          questionColumns: questionColumns.map(q => q.key), // e.g. ['Q1', 'Q2', 'Q3']
          maxMarksMap,
          studentRecords
        });

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

// Helper to find the value immediately to the right of a keyword in a row
const extractValueAfter = (rowArray, keyword) => {
  for (let i = 0; i < rowArray.length; i++) {
    if (String(rowArray[i]).toLowerCase().includes(keyword.toLowerCase())) {
      // Return the next non-null cell
      for (let j = i + 1; j < rowArray.length; j++) {
        if (rowArray[j]) return String(rowArray[j]).trim();
      }
    }
  }
  return '';
};
