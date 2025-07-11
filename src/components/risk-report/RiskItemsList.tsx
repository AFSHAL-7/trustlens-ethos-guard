
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Check, AlertCircle, Info } from 'lucide-react';

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

const RiskItemsList: React.FC<RiskItemsListProps> = ({ risks }) => {
  const getRiskConfig = (severity: string) => {
    switch (severity) {
      case 'high': 
        return { 
          color: 'text-red-600', 
          bg: 'bg-red-50', 
          border: 'border-red-200',
          icon: AlertTriangle,
          badge: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'medium': 
        return { 
          color: 'text-orange-600', 
          bg: 'bg-orange-50', 
          border: 'border-orange-200',
          icon: AlertCircle,
          badge: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'low': 
        return { 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-50', 
          border: 'border-yellow-200',
          icon: Info,
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default: 
        return { 
          color: 'text-gray-600', 
          bg: 'bg-gray-50', 
          border: 'border-gray-200',
          icon: Info,
          badge: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          Risk Analysis Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {risks.map((risk, index) => {
            const config = getRiskConfig(risk.severity);
            const Icon = config.icon;
            
            return (
              <div 
                key={risk.id} 
                className={`${config.border} border rounded-2xl p-6 hover:shadow-soft transition-all duration-300 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${config.bg} mr-3`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">{risk.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${config.badge}`}>
                      {risk.severity.toUpperCase()} RISK
                    </span>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                      {risk.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 pl-14">{risk.description}</p>
                
                <div className="pl-14 space-y-4">
                  <div className={`${config.bg} border ${config.border} rounded-xl p-4`}>
                    <h4 className={`font-medium ${config.color} mb-2`}>Problematic Clause:</h4>
                    <p className={`text-sm ${config.color} italic`}>{risk.specific_clause}</p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h4 className="font-medium text-orange-800 mb-2">Potential Impact:</h4>
                    <p className="text-sm text-orange-700">{risk.impact}</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Our Recommendation:</h4>
                    <p className="text-sm text-blue-700">{risk.recommendation}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {risks.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="bg-green-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-foreground">No significant risks detected</p>
              <p className="text-muted-foreground">This document appears to follow privacy best practices</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskItemsList;
