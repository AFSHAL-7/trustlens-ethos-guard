
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, Info } from 'lucide-react';

interface ConsentDecisionCardProps {
  onConsent: (action: 'allow' | 'partial' | 'deny') => void;
  consentAction: 'allow' | 'partial' | 'deny' | null;
}

const ConsentDecisionCard: React.FC<ConsentDecisionCardProps> = ({ 
  onConsent, 
  consentAction 
}) => {
  return (
    <Card className="col-span-1 bg-gradient-to-r from-blue-50 to-blue-100 border-none shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle className="text-foreground">Your Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full bg-trustlens-green hover:bg-green-600 text-white flex justify-between items-center transition-all duration-300 hover:scale-105" 
          onClick={() => onConsent('allow')}
          disabled={consentAction !== null}
        >
          <span>Accept All Terms</span>
          <Check className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-orange-400 text-orange-600 hover:bg-orange-50 flex justify-between items-center transition-all duration-300 hover:scale-105" 
          onClick={() => onConsent('partial')}
          disabled={consentAction !== null}
        >
          <span>Partial Consent</span>
          <AlertTriangle className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-red-400 text-red-600 hover:bg-red-50 flex justify-between items-center transition-all duration-300 hover:scale-105" 
          onClick={() => onConsent('deny')}
          disabled={consentAction !== null}
        >
          <span>Reject Terms</span>
          <Info className="h-5 w-5" />
        </Button>
      </CardContent>
      {consentAction && (
        <CardFooter className="animate-fade-in">
          <p className="text-sm text-muted-foreground italic">
            {consentAction === 'allow' 
              ? 'Full consent granted. Saving analysis...' 
              : consentAction === 'partial'
                ? 'Partial consent granted. Saving analysis...'
                : 'Consent denied. Saving analysis...'}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ConsentDecisionCard;
