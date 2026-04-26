import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

/**
 * Generates a PDF from a given HTML element.
 * @param {HTMLElement} element - The DOM element to convert to PDF.
 * @param {string} filename - Output filename.
 */
export const exportToPDF = (element, filename = 'academic_report.pdf') => {
  if (!element) return;

  const opt = {
    margin:       10,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  // Add a temporary class to the element to fix dark mode text colors in PDF if needed, 
  // or just let html2canvas render exactly what is on screen.
  html2pdf().set(opt).from(element).save();
};

/**
 * Generates an Excel file from the analyzed JSON data.
 * @param {Array} data - The array of student objects.
 * @param {string} filename - Output filename.
 */
export const exportToExcel = (data, filename = 'academic_analysis.xlsx') => {
  if (!data || data.length === 0) return;

  // Map data to a cleaner format for Excel export
  const exportData = data.map((student, index) => ({
    'Rank': student.rank || index + 1,
    'Roll No': student.rollNo,
    'Student Name': student.name,
    'Subject': student.subject || 'General',
    'Sessional Marks': student.sessional,
    'Final Marks': student.final,
    'Total Score (%)': student.percentage,
    'Grade': student.grade
  }));

  // Create a new workbook and add the worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Analyzed Results");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
};
