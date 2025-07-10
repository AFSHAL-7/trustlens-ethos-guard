
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface SummarySection {
  title: string;
  content: string;
  risk_level: 'high' | 'medium' | 'low';
  specific_issues: string[];
}

interface DetailedAnalysisProps {
  summary: SummarySection[];
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ summary }) => {
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2 text-trustlens-blue" />
          Detailed Privacy Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {summary.map((section, index) => (
            <div key={index} className="pb-6 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{section.title}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityBadgeColor(section.risk_level)}`}>
                  {section.risk_level.toUpperCase()} RISK
                </span>
              </div>
              <p className="text-gray-700 mb-4">{section.content}</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Specific Issues Identified:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {section.specific_issues.map((issue, issueIndex) => (
                    <li key={issueIndex} className="text-sm text-gray-600">{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedAnalysis;
