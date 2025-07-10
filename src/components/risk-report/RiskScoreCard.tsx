
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield } from 'lucide-react';

interface RiskScoreCardProps {
  riskScore: number;
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ riskScore }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Risk Score
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div 
          className={`text-5xl font-bold mb-4 ${
            riskScore > 80 ? 'text-red-500' : riskScore > 60 ? 'text-orange-500' : 'text-green-500'
          }`}
        >
          {riskScore}%
        </div>
        <Progress 
          value={riskScore} 
          className={`h-3 ${
            riskScore > 80 ? 'bg-red-100' : riskScore > 60 ? 'bg-orange-100' : 'bg-green-100'
          }`}
          indicatorClassName={
            riskScore > 80 ? 'bg-red-500' : riskScore > 60 ? 'bg-orange-500' : 'bg-green-500'
          }
        />
        <p className="mt-4 text-gray-600">
          {riskScore > 80 
            ? 'High risk. Multiple significant privacy violations detected.' 
            : riskScore > 60 
              ? 'Moderate risk. Several privacy concerns identified.'
              : 'Low risk. Few privacy concerns detected.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default RiskScoreCard;
