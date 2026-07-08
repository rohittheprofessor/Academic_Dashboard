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
            
            const hNorm = h.replace(/[\s.]/g, '');
            if (colMap.sNo === -1 && (hNorm === 'sno' || hNorm === 'srno')) colMap.sNo = index;
            else if (colMap.studentId === -1 && h.includes('student id')) colMap.studentId = index;
            else if (colMap.rollNo === -1 && (h.includes('roll no') || h.includes('rollno'))) colMap.rollNo = index;
            else if (colMap.name === -1 && h.includes('name')) colMap.name = index;
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

        // Fallback: some sheets (e.g. assignment sheets) have no Q1/Q2-style
        // labels at all — just blank header cells above numeric mark columns.
        // Treat any unclaimed column that has a numeric value in the first
        // student row as a positional question column (Q1, Q2, Q3...).
        if (questionColumns.length === 0) {
          const claimed = new Set([colMap.sNo, colMap.studentId, colMap.rollNo, colMap.name, colMap.total, colMap.percentage]);
          const firstDataRow = rawRows[tableStartRowIndex + 1] || [];
          const headerRow = rawRows[tableStartRowIndex] || [];
          const width = Math.max(headerRow.length, firstDataRow.length);
          let qNum = 1;
          for (let idx = 0; idx < width; idx++) {
            if (claimed.has(idx)) continue;
            const sample = firstDataRow[idx];
            if (sample === null || sample === undefined || sample === '' || isNaN(Number(sample))) continue;
            questionColumns.push({ key: `Q${qNum}`, originalKey: `Q${qNum}`, index: idx });
            qNum++;
          }
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

          // Extract question marks — a truly blank cell means "did not
          // attempt this question" and must be OMITTED from the marks map
          // (not stored as 0 or null), so it's excluded from downstream
          // totals rather than silently counted as a real zero. This
          // matters a lot for Makeup files, which typically list every
          // student but only fill in marks for those who actually sat it.
          let calculatedTotal = 0;
          questionColumns.forEach(qCol => {
            const raw = row[qCol.index];
            const isBlank = raw === null || raw === undefined || raw === '';
            if (isBlank) return; // omit key entirely
            const val = Number(raw);
            if (isNaN(val)) return;
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

/**
 * Parses a CES-style course-exit-survey sheet: a row of CO1..CO5 labels
 * (repeated once per survey question block) sits above the student table,
 * with each rating column already implicitly mapped to a specific CO —
 * so no manual question -> CO mapping step is needed.
 */
export const parseCesExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        const metadata = {
          paperCode: '', course: '', program: '', semester: '', section: '', session: '',
          testName: 'Course Exit Survey'
        };

        let coRowIndex = -1;
        let coRowBestCount = 0;
        let headerRowIndex = -1;

        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row) continue;
          const rowStr = row.join(' ').toLowerCase();

          if (rowStr.includes('paper code')) metadata.paperCode = extractValueAfter(row, 'paper code');
          if (rowStr.includes('semester')) metadata.semester = extractValueAfter(row, 'semester');
          if (rowStr.includes('section')) metadata.section = extractValueAfter(row, 'section');
          if (rowStr.includes('session')) metadata.session = extractValueAfter(row, 'session');

          // A sheet can have a small CO1..CO5 legend elsewhere above the real
          // header — take the row with the MOST CO-label matches, not just
          // the first row with 2+, so a 5-cell legend doesn't win over the
          // real (e.g. 25-column) mapping header below it.
          const coCount = row.filter((c) => c && /^CO\s*\d+$/i.test(String(c).trim())).length;
          if (coCount >= 2 && coCount > coRowBestCount) {
            coRowBestCount = coCount;
            coRowIndex = i;
          }

          if (rowStr.includes('roll no') || rowStr.includes('student id')) {
            headerRowIndex = i;
            break;
          }
        }

        if (coRowIndex === -1) throw new Error("Could not find the CO header row (a row containing CO1, CO2, CO3... labels above the student table).");
        if (headerRowIndex === -1) throw new Error("Could not find a 'Roll No' column.");

        const coRow = rawRows[coRowIndex];
        const colToCO = {};
        coRow.forEach((cell, idx) => {
          if (cell && /^CO\s*\d+$/i.test(String(cell).trim())) {
            colToCO[idx] = String(cell).trim().toUpperCase().replace(/\s+/g, '');
          }
        });

        const colIndexes = Object.keys(colToCO).map(Number).sort((a, b) => a - b);
        if (colIndexes.length === 0) throw new Error("Found a CO header row but couldn't read any CO1..CO5 style labels from it.");

        // Max rating per column: look for a numeric value in the same column,
        // scanning from the CO-label row through just after the Roll No row.
        const maxMarksMap = {};
        for (let r = coRowIndex; r <= headerRowIndex + 1 && r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row) continue;
          colIndexes.forEach((idx) => {
            if (maxMarksMap[idx] === undefined && typeof row[idx] === 'number') {
              maxMarksMap[idx] = row[idx];
            }
          });
        }
        colIndexes.forEach((idx) => { if (maxMarksMap[idx] === undefined) maxMarksMap[idx] = 5; });

        let rollIdx = -1, nameIdx = -1;
        rawRows[headerRowIndex].forEach((cell, idx) => {
          if (!cell) return;
          const h = String(cell).toLowerCase();
          if (rollIdx === -1 && (h.includes('roll no') || h.includes('rollno'))) rollIdx = idx;
          else if (nameIdx === -1 && h.includes('name')) nameIdx = idx;
        });
        if (rollIdx === -1) throw new Error("Could not find the Roll No column in the header row.");

        // Synthetic Q1..Qn keys, positionally assigned, each already tagged with its real CO.
        const questionColumns = colIndexes.map((_, qi) => `Q${qi + 1}`);
        const coMap = {};
        const maxMarksByKey = {};
        colIndexes.forEach((idx, qi) => {
          coMap[`Q${qi + 1}`] = colToCO[idx];
          maxMarksByKey[`Q${qi + 1}`] = maxMarksMap[idx];
        });

        const studentRecords = [];
        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row) continue;
          const rNo = String(row[rollIdx] || '').trim();
          if (!rNo || rNo.toLowerCase().includes('roll no')) continue;

          const marks = {};
          let total = 0;
          colIndexes.forEach((idx, qi) => {
            const key = `Q${qi + 1}`;
            const raw = row[idx];
            const isBlank = raw === null || raw === undefined || raw === '';
            if (isBlank) return; // omit key entirely
            const val = Number(raw);
            if (isNaN(val)) return;
            marks[key] = val;
            total += val;
          });

          studentRecords.push({
            rollNo: rNo,
            name: nameIdx !== -1 ? String(row[nameIdx] || 'Unknown') : 'Unknown',
            marks,
            totalMarks: total,
            percentage: 0 // CES has no single overall %; only per-CO % matters
          });
        }

        if (studentRecords.length === 0) throw new Error("No student rows found below the header row.");

        resolve({ metadata, questionColumns, coMap, maxMarksMap: maxMarksByKey, studentRecords });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
export const parseSeeExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        const metadata = {
          paperCode: '', course: '', program: '', semester: '', section: '', session: '',
          testName: 'External Exam'
        };

        let headerRowIndex = -1;
        const colMap = { rollNo: -1, name: -1, marks: -1 };
        let maxMarks = 100;

        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row) continue;
          const rowStr = row.join(' ').toLowerCase();

          if (rowStr.includes('paper code')) metadata.paperCode = extractValueAfter(row, 'paper code');
          if (rowStr.includes('semester')) metadata.semester = extractValueAfter(row, 'semester');
          if (rowStr.includes('section')) metadata.section = extractValueAfter(row, 'section');
          if (rowStr.includes('session')) metadata.session = extractValueAfter(row, 'session');

          if (rowStr.includes('roll no') || rowStr.includes('student id')) {
            headerRowIndex = i;
            row.forEach((cell, idx) => {
              if (cell === null || cell === undefined || cell === '') return;
              // A bare number sitting in the header row is the max-marks
              // value for that column (this is exactly your sheet's layout).
              if (typeof cell === 'number') {
                colMap.marks = idx;
                maxMarks = cell;
                return;
              }
              const h = String(cell).toLowerCase().trim();
              if (colMap.rollNo === -1 && (h.includes('roll no') || h.includes('rollno'))) colMap.rollNo = idx;
              else if (colMap.name === -1 && h.includes('name')) colMap.name = idx;
              else if (colMap.marks === -1 && /marks|score|obtained|total/.test(h)) colMap.marks = idx;
            });
            break;
          }
        }

        if (headerRowIndex === -1 || colMap.rollNo === -1) {
          throw new Error("Could not find a 'Roll No' column. Make sure the sheet has a header row containing 'Roll No'.");
        }
        if (colMap.marks === -1) {
          throw new Error("Could not find the marks column. Add a header like 'Marks Obtained', or leave the max-marks number (e.g. 100) directly in that column's header cell.");
        }

        const studentRecords = [];
        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row) continue;
          const rNo = String(row[colMap.rollNo] || '').trim();
          if (!rNo || rNo.toLowerCase().includes('roll no')) continue;

          const marksVal = Number(row[colMap.marks]);
          if (row[colMap.marks] === null || row[colMap.marks] === undefined || isNaN(marksVal)) continue;

          const pct = maxMarks > 0 ? Number(((marksVal / maxMarks) * 100).toFixed(2)) : 0;
          studentRecords.push({
            rollNo: rNo,
            name: colMap.name !== -1 ? String(row[colMap.name] || 'Unknown') : 'Unknown',
            marks: { Q1: marksVal },
            totalMarks: marksVal,
            percentage: pct
          });
        }

        if (studentRecords.length === 0) {
          throw new Error("No student rows with a valid mark were found below the header row.");
        }

        resolve({ metadata, maxMarks, studentRecords });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
