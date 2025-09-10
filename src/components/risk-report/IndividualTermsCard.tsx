import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';

interface Term {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  required: boolean;
}

interface IndividualTermsCardProps {
  terms: Term[];
  onDecisionSubmit: (decisions: { termId: string; accepted: boolean }[], globalAction: 'allow' | 'partial' | 'deny') => void;
  disabled: boolean;
}

const IndividualTermsCard: React.FC<IndividualTermsCardProps> = ({ 
  terms, 
  onDecisionSubmit, 
  disabled 
}) => {
  const [termDecisions, setTermDecisions] = useState<{ [key: string]: boolean }>({});

  const handleTermToggle = (termId: string, accepted: boolean) => {
    setTermDecisions(prev => ({
      ...prev,
      [termId]: accepted
    }));
  };

  const handleSubmitDecisions = (action: 'allow' | 'partial' | 'deny') => {
    const decisions = terms.map(term => ({
      termId: term.id,
      accepted: action === 'allow' ? true : action === 'deny' ? false : (termDecisions[term.id] ?? false)
    }));
    
    onDecisionSubmit(decisions, action);
  };

  const getAcceptedCount = () => {
    return Object.values(termDecisions).filter(Boolean).length;
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="col-span-1 bg-gradient-to-r from-purple-50 to-blue-50 border-none shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Individual Terms Review
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review and decide on each term separately
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Individual Terms */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {terms.map((term) => (
            <div 
              key={term.id}
              className="flex items-start space-x-3 p-3 rounded-lg border bg-white/50"
            >
              <Checkbox
                id={term.id}
                checked={termDecisions[term.id] ?? false}
                onCheckedChange={(checked) => handleTermToggle(term.id, checked as boolean)}
                disabled={disabled}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor={term.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {term.title}
                  </label>
                  <Badge className={getRiskBadgeColor(term.riskLevel)}>
                    {term.riskLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {term.description}
                </p>
                {term.required && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="text-center text-sm text-muted-foreground">
          {getAcceptedCount()} of {terms.length} terms accepted
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-trustlens-green hover:bg-green-600 text-white flex justify-between items-center transition-all duration-300 hover:scale-105" 
            onClick={() => handleSubmitDecisions('allow')}
            disabled={disabled}
          >
            <span>Accept All Terms</span>
            <Check className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-orange-400 text-orange-600 hover:bg-orange-50 flex justify-between items-center transition-all duration-300 hover:scale-105" 
            onClick={() => handleSubmitDecisions('partial')}
            disabled={disabled}
          >
            <span>Submit Selected Terms</span>
            <AlertTriangle className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-red-400 text-red-600 hover:bg-red-50 flex justify-between items-center transition-all duration-300 hover:scale-105" 
            onClick={() => handleSubmitDecisions('deny')}
            disabled={disabled}
          >
            <span>Reject All Terms</span>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualTermsCard;