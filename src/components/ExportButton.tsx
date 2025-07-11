
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Image, Table, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  reportData: {
    documentTitle: string;
    riskScore: number;
    riskItems: Array<{
      clause: string;
      risk: string;
      impact: string;
      recommendation: string;
    }>;
    summaryData: Array<{
      title: string;
      content: string;
      riskLevel: 'low' | 'medium' | 'high';
    }>;
    originalText: string;
  };
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

const ExportButton: React.FC<ExportButtonProps> = ({ reportData }) => {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportType, setExportType] = useState<string>('');

  const generatePDF = async () => {
    setExportStatus('exporting');
    setExportType('PDF');
    
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple text content for demonstration
      const content = `
TrustLens Risk Analysis Report
============================

Document: ${reportData.documentTitle}
Risk Score: ${reportData.riskScore}/100
Generated: ${new Date().toLocaleDateString()}

RISK ANALYSIS
=============

${reportData.riskItems.map((item, index) => `
${index + 1}. ${item.clause}
   Risk: ${item.risk}
   Impact: ${item.impact}
   Recommendation: ${item.recommendation}
`).join('\n')}

SUMMARY
=======

${reportData.summaryData.map((section, index) => `
${index + 1}. ${section.title} (Risk Level: ${section.riskLevel.toUpperCase()})
   ${section.content}
`).join('\n')}

ORIGINAL DOCUMENT
=================

${reportData.originalText}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.documentTitle.replace(/[^a-z0-9]/gi, '_')}_risk_report.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExportStatus('success');
      toast.success('PDF report downloaded successfully');
      
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      toast.error('Failed to generate PDF report');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const generateCSV = async () => {
    setExportStatus('exporting');
    setExportType('CSV');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const csvContent = [
        ['Risk Item', 'Risk Description', 'Impact', 'Recommendation', 'Risk Level'],
        ...reportData.riskItems.map((item, index) => [
          item.clause,
          item.risk,
          item.impact,
          item.recommendation,
          reportData.riskScore > 80 ? 'High' : reportData.riskScore > 60 ? 'Medium' : 'Low'
        ])
      ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.documentTitle.replace(/[^a-z0-9]/gi, '_')}_risk_data.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExportStatus('success');
      toast.success('CSV data downloaded successfully');
      
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      toast.error('Failed to generate CSV file');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const generateJSON = async () => {
    setExportStatus('exporting');
    setExportType('JSON');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const jsonData = {
        document_title: reportData.documentTitle,
        risk_score: reportData.riskScore,
        analysis_date: new Date().toISOString(),
        risk_items: reportData.riskItems,
        summary_sections: reportData.summaryData,
        original_text: reportData.originalText
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.documentTitle.replace(/[^a-z0-9]/gi, '_')}_risk_report.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExportStatus('success');
      toast.success('JSON report downloaded successfully');
      
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      toast.error('Failed to generate JSON file');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'exporting':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <Download className="h-4 w-4 text-red-600" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (exportStatus) {
      case 'exporting':
        return `Generating ${exportType}...`;
      case 'success':
        return `${exportType} Downloaded`;
      case 'error':
        return 'Export Failed';
      default:
        return 'Export Report';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="hover:scale-105 transition-transform"
          disabled={exportStatus === 'exporting'}
        >
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={generatePDF} disabled={exportStatus === 'exporting'}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateCSV} disabled={exportStatus === 'exporting'}>
          <Table className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateJSON} disabled={exportStatus === 'exporting'}>
          <Image className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
