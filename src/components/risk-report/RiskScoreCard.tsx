
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskScoreCardProps {
  riskScore: number;
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ riskScore }) => {
  const getRiskLevel = () => {
    if (riskScore >= 80) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
    if (riskScore >= 60) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle };
    if (riskScore >= 40) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Shield };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
  };

  const risk = getRiskLevel();
  const Icon = risk.icon;

  return (
    <Card className="col-span-1 animate-fade-in hover:shadow-soft-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className={`${risk.bg} rounded-2xl p-6 transition-all duration-300`}>
          <div className="flex items-center justify-center mb-4">
            <Icon className={`h-8 w-8 ${risk.color}`} />
          </div>
          <div 
            className={`text-5xl font-bold mb-2 ${risk.color} animate-pulse-slow`}
          >
            {riskScore}%
          </div>
          <div className={`text-lg font-semibold ${risk.color}`}>
            {risk.level} Risk
          </div>
        </div>
        
        <Progress 
          value={riskScore} 
          className="h-4 bg-muted"
          indicatorClassName={
            riskScore >= 80 ? 'bg-red-500' : 
            riskScore >= 60 ? 'bg-orange-500' : 
            riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
          }
        />
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {riskScore >= 80 
            ? 'Critical privacy violations detected. Immediate action recommended.' 
            : riskScore >= 60 
              ? 'High risk identified. Review terms carefully before proceeding.'
              : riskScore >= 40
                ? 'Moderate risk detected. Some privacy concerns identified.'
                : 'Low risk detected. Terms appear to follow good privacy practices.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default RiskScoreCard;
