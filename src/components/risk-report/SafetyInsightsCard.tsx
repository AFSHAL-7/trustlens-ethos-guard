import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface SafetyInsightsCardProps {
  insights: {
    comparisonToSafeServices: string;
    recommendedUsage: string;
    trustScore: number;
    keyWarnings: string[];
  };
}

const SafetyInsightsCard: React.FC<SafetyInsightsCardProps> = ({ insights }) => {
  const getTrustLevel = (score: number) => {
    if (score >= 80) return { level: 'Highly Trusted', color: 'bg-green-500 text-white', icon: CheckCircle };
    if (score >= 60) return { level: 'Moderately Trusted', color: 'bg-orange-500 text-white', icon: Shield };
    return { level: 'Low Trust', color: 'bg-red-500 text-white', icon: AlertTriangle };
  };

  const trustLevel = getTrustLevel(insights.trustScore);
  const TrustIcon = trustLevel.icon;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Safety Analysis</CardTitle>
              <CardDescription>Deep insights from real-world comparisons</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={trustLevel.color}>
              <TrustIcon className="h-3 w-3 mr-1" />
              {trustLevel.level}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{insights.trustScore}%</div>
              <div className="text-xs text-muted-foreground">Trust Score</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comparison to Safe Services */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            Comparison to Known Safe Services
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insights.comparisonToSafeServices}
          </p>
        </div>

        {/* Recommended Usage */}
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
          <h4 className="font-medium mb-2 text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Safe Usage Recommendations
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insights.recommendedUsage}
          </p>
        </div>

        {/* Key Warnings */}
        {insights.keyWarnings && insights.keyWarnings.length > 0 && (
          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <h4 className="font-medium mb-2 text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Critical Warnings
            </h4>
            <ul className="space-y-2">
              {insights.keyWarnings.map((warning, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span className="leading-relaxed">{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SafetyInsightsCard;
