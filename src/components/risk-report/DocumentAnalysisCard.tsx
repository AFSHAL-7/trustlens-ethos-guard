
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar } from 'lucide-react';

interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  specific_clause: string;
  impact: string;
  recommendation: string;
}

interface DocumentAnalysisCardProps {
  risks: RiskItem[];
}

const DocumentAnalysisCard: React.FC<DocumentAnalysisCardProps> = ({ risks }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Document Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Document Type:</span>
            <span className="text-sm font-medium">Privacy Policy & Terms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Risk Items Found:</span>
            <span className="text-sm font-medium">{risks.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">High Risk Issues:</span>
            <span className="text-sm font-medium text-red-600">
              {risks.filter(r => r.severity === 'high').length}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Analyzed on {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentAnalysisCard;
