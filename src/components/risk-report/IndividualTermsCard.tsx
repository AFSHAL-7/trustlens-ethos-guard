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
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'low': return <Shield className="h-4 w-4 text-accent" />;
      default: return null;
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900';
      case 'low': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Info className="h-5 w-5 text-primary" />
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
                ? 'bg-card border-primary/30' 
                : 'bg-muted/50 border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm text-foreground">{term.title}</h4>
                  {term.isRequired && (
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {getRiskIcon(term.risk)}
                    <Badge 
                      variant="outline"
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
        
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-2">How this works:</p>
              <ul className="text-muted-foreground space-y-1.5">
                <li className="flex gap-2"><span className="text-foreground">•</span> <span><strong className="text-foreground">Required terms</strong> cannot be disabled - they're essential for the service</span></li>
                <li className="flex gap-2"><span className="text-foreground">•</span> <span><strong className="text-foreground">Optional terms</strong> can be customized based on your privacy preferences</span></li>
                <li className="flex gap-2"><span className="text-foreground">•</span> <span>You can change these settings later in most services</span></li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualTermsCard;