import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Shield } from 'lucide-react';

interface DocumentSummaryCardProps {
  documentTitle: string;
  companyName?: string;
  riskScore: number;
  summary: string;
  analysisTime?: string;
}

const DocumentSummaryCard: React.FC<DocumentSummaryCardProps> = ({ 
  documentTitle,
  companyName,
  riskScore, 
  summary,
  analysisTime = "Just now"
}) => {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'High Risk', color: 'bg-red-500 text-white' };
    if (score >= 60) return { level: 'Medium Risk', color: 'bg-orange-500 text-white' };
    return { level: 'Low Risk', color: 'bg-green-500 text-white' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{documentTitle}</CardTitle>
              {companyName && (
                <div className="text-sm font-medium text-primary mt-1">
                  {companyName}
                </div>
              )}
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3" />
                Analyzed {analysisTime}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={riskLevel.color}>
              <Shield className="h-3 w-3 mr-1" />
              {riskLevel.level}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{riskScore}%</div>
              <div className="text-xs text-muted-foreground">Risk Score</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-foreground">Quick Summary</h4>
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {summary}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSummaryCard;