
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Check } from 'lucide-react';

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

interface RiskItemsListProps {
  risks: RiskItem[];
}

export const RiskItemsList: React.FC<RiskItemsListProps> = ({ risks }) => {
  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-400';
      case 'low': return 'bg-yellow-300';
      default: return 'bg-gray-400';
    }
  };

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
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          Problematic Terms & Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {risks.map((risk) => (
            <div key={risk.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${getRiskColor(risk.severity)} mr-3`} />
                  <h3 className="font-semibold text-lg">{risk.title}</h3>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityBadgeColor(risk.severity)}`}>
                    {risk.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
                    {risk.category}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 pl-6">{risk.description}</p>
              
              <div className="pl-6 space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-medium text-red-800 mb-1">Problematic Clause:</h4>
                  <p className="text-sm text-red-700 italic">{risk.specific_clause}</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h4 className="font-medium text-orange-800 mb-1">Potential Impact:</h4>
                  <p className="text-sm text-orange-700">{risk.impact}</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-1">Our Recommendation:</h4>
                  <p className="text-sm text-blue-700">{risk.recommendation}</p>
                </div>
              </div>
            </div>
          ))}

          {risks.length === 0 && (
            <div className="text-center py-8">
              <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium">No significant risks detected</p>
              <p className="text-gray-600">This document appears to follow privacy best practices</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
