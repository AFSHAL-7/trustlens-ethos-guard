
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

interface IndividualTermDecision {
  termId: string;
  accepted: boolean;
}

interface ConsentDecisionCardProps {
  onConsent: (action: 'allow' | 'partial' | 'deny', termDecisions?: IndividualTermDecision[]) => void;
  consentAction: 'allow' | 'partial' | 'deny' | null;
  hasIndividualTerms?: boolean;
  onIndividualTermsChange?: (decisions: IndividualTermDecision[]) => void;
}

const ConsentDecisionCard: React.FC<ConsentDecisionCardProps> = ({ 
  onConsent, 
  consentAction,
  hasIndividualTerms = false,
  onIndividualTermsChange
}) => {
  const [individualDecisions, setIndividualDecisions] = useState<IndividualTermDecision[]>([]);

  const handleIndividualDecision = (action: 'allow' | 'partial' | 'deny') => {
    if (hasIndividualTerms && action === 'partial') {
      // For partial consent, we'll let the parent handle the individual terms
      onConsent(action, individualDecisions);
    } else {
      onConsent(action);
    }
  };

  const updateIndividualDecisions = (decisions: IndividualTermDecision[]) => {
    setIndividualDecisions(decisions);
    if (onIndividualTermsChange) {
      onIndividualTermsChange(decisions);
    }
  };
  return (
    <Card className="col-span-1 bg-gradient-to-r from-blue-50 to-blue-100 border-none shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-foreground">Your Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full bg-trustlens-green hover:bg-green-600 text-white flex justify-between items-center transition-all duration-300 hover:scale-105" 
          onClick={() => handleIndividualDecision('allow')}
          disabled={consentAction !== null}
        >
          <span>Accept All Terms</span>
          <Check className="h-5 w-5" />
        </Button>
        
        {hasIndividualTerms && (
          <Button 
            variant="outline" 
            className="w-full border-orange-400 text-orange-600 hover:bg-orange-50 flex justify-between items-center transition-all duration-300 hover:scale-105" 
            onClick={() => handleIndividualDecision('partial')}
            disabled={consentAction !== null}
          >
            <span>Customize Terms</span>
            <AlertTriangle className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full border-red-400 text-red-600 hover:bg-red-50 flex justify-between items-center transition-all duration-300 hover:scale-105" 
          onClick={() => handleIndividualDecision('deny')}
          disabled={consentAction !== null}
        >
          <span>Reject All Terms</span>
          <X className="h-5 w-5" />
        </Button>
      </CardContent>
      {consentAction && (
        <CardFooter className="animate-fade-in">
          <div className="text-sm text-muted-foreground italic space-y-1">
            {consentAction === 'allow' && (
              <p className="text-green-600">✓ Full consent granted. Saving analysis...</p>
            )}
            {consentAction === 'partial' && (
              <div className="text-orange-600">
                <p>⚡ Customized consent saved.</p>
                <p className="text-xs">You can modify these preferences later.</p>
              </div>
            )}
            {consentAction === 'deny' && (
              <p className="text-red-600">✗ All terms rejected. Saving decision...</p>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ConsentDecisionCard;
