import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Info, Lock } from 'lucide-react';

interface IndividualTerm {
  id: string;
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  isRequired: boolean;
}

interface IndividualTermsCardProps {
  terms: IndividualTerm[];
  onTermsChange: (termDecisions: Array<{ termId: string; accepted: boolean }>) => void;
  disabled?: boolean;
}

const IndividualTermsCard: React.FC<IndividualTermsCardProps> = ({ 
  terms, 
  onTermsChange, 
  disabled = false 
}) => {
  const [termDecisions, setTermDecisions] = useState<Record<string, boolean>>(
    terms.reduce((acc, term) => ({
      ...acc,
      [term.id]: term.isRequired
    }), {})
  );

  const handleTermToggle = (termId: string, accepted: boolean) => {
    const newDecisions = {
      ...termDecisions,
      [termId]: accepted
    };
    
    setTermDecisions(newDecisions);
    
    // Convert to array format for parent component
    const decisionsArray = Object.entries(newDecisions).map(([termId, accepted]) => ({
      termId,
      accepted
    }));
    
    onTermsChange(decisionsArray);
  };

  const getRiskIcon = (risk: string) => {
    switch(risk) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-orange-500" />;
      case 'low': return <Shield className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return 'bg-muted text-destructive';
      case 'medium': return 'bg-muted text-orange-700 dark:text-orange-400';
      case 'low': return 'bg-muted text-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Individual Terms & Conditions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review and customize your consent for different aspects of the service
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {terms.map((term) => (
          <div 
            key={term.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              termDecisions[term.id] 
                ? 'bg-muted/50 border-border' 
                : 'bg-muted/30 border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{term.title}</h4>
                  {term.isRequired && (
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">Required</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {getRiskIcon(term.risk)}
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${getRiskColor(term.risk)}`}
                    >
                      {term.risk} risk
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {term.description}
                </p>
              </div>
              
              <div className="flex items-center">
                <Switch
                  checked={termDecisions[term.id]}
                  onCheckedChange={(checked) => handleTermToggle(term.id, checked)}
                  disabled={disabled || term.isRequired}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-3 bg-muted border border-border rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">How this works:</p>
              <ul className="mt-1 text-muted-foreground space-y-1">
                <li>• <strong>Required terms</strong> cannot be disabled - they're essential for the service</li>
                <li>• <strong>Optional terms</strong> can be customized based on your privacy preferences</li>
                <li>• You can change these settings later in most services</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualTermsCard;