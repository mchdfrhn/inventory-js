import React from 'react';

// This component is no longer needed since PDF generation is moved to ReportsPage
// Keeping this file for backward compatibility but it will not render anything

interface PDFReportGeneratorProps {
  assets: any[];
  filename?: string;
}

const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = () => {
  // Component is deprecated - PDF generation moved to /reports page
  return null;
};

export default PDFReportGenerator;
