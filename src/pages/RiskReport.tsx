
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ConsentDecisionCard from '@/components/risk-report/ConsentDecisionCard';
import IndividualTermsCard from '@/components/risk-report/IndividualTermsCard';
import DocumentSummaryCard from '@/components/risk-report/DocumentSummaryCard';
import SafetyInsightsCard from '@/components/risk-report/SafetyInsightsCard';
import ExportButton from '@/components/ExportButton';

export interface RiskItem {
  clause: string;
  risk: string;
  impact: string;
  recommendation: string;
}

export interface SummarySection {
  title: string;
  content: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface IndividualTerm {
  id: string;
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  isRequired: boolean;
}

interface IndividualTermDecision {
  termId: string;
  accepted: boolean;
}

const RiskReport: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consentDecision, setConsentDecision] = useState<'allow' | 'partial' | 'deny' | null>(null);
  const [saving, setSaving] = useState(false);
  const [showIndividualTerms, setShowIndividualTerms] = useState(false);
  const [individualTermDecisions, setIndividualTermDecisions] = useState<IndividualTermDecision[]>([]);

  // Get analysis results from location state
  const analysisResult = location.state?.analysisResult;
  const originalText = location.state?.originalText;

  // Use analysis results or fall back to defaults for missing data
  const reportData = analysisResult || {
    documentTitle: "Untitled Document",
    riskScore: 0,
    riskItems: [],
    summaryData: [],
    individualTerms: []
  };

  // Redirect to analyzer if no data
  useEffect(() => {
    if (!analysisResult && !originalText) {
      toast.error('No analysis data found. Please analyze a document first.');
      navigate('/analyzer');
    }
  }, [analysisResult, originalText, navigate]);

  const handleSaveDecision = async (decision: 'allow' | 'partial' | 'deny', termDecisions?: IndividualTermDecision[]) => {
    if (!user) {
      toast.error('Please sign in to save your decision');
      return;
    }

    setConsentDecision(decision);
    setSaving(true);

    try {
      // Save the consent analysis to database - convert arrays to JSON
      const analysisData = {
        user_id: user.id,
        document_title: reportData.documentTitle,
        risk_score: reportData.riskScore,
        consent_decision: decision,
        risk_items: JSON.stringify(reportData.riskItems),
        summary_sections: JSON.stringify(reportData.summaryData),
        original_text: originalText || '',
        individual_terms_decisions: JSON.stringify(termDecisions || [])
      };

      const { error: insertError } = await supabase
        .from('consent_analyses')
        .insert(analysisData);

      if (insertError) {
        console.error('Error saving analysis:', insertError);
        toast.error('Failed to save analysis');
        return;
      }

      // Update user stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const newTotalAnalyses = (currentStats?.total_analyses || 0) + 1;
      const newHighRiskAnalyses = reportData.riskScore > 70 
        ? (currentStats?.high_risk_analyses || 0) + 1 
        : (currentStats?.high_risk_analyses || 0);
      const newConsentDecisions = (currentStats?.consent_decisions_count || 0) + 1;
      
      const currentAvgScore = currentStats?.average_risk_score || 0;
      const currentTotal = currentStats?.total_analyses || 0;
      const newAvgScore = Math.round(((currentAvgScore * currentTotal) + reportData.riskScore) / newTotalAnalyses);

      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_analyses: newTotalAnalyses,
          high_risk_analyses: newHighRiskAnalyses,
          average_risk_score: newAvgScore,
          consent_decisions_count: newConsentDecisions,
          last_active: new Date().toISOString()
        });

      if (statsError) {
        console.error('Error updating stats:', statsError);
      }

      toast.success(`Consent decision saved: ${decision}`);
      
      // Navigate to dashboard with the new consent data
      setTimeout(() => {
        navigate('/dashboard', {
          state: {
            newConsent: {
              title: reportData.documentTitle,
              action: decision,
              timestamp: new Date().toISOString(),
              riskScore: reportData.riskScore
            }
          }
        });
      }, 1000);

    } catch (error) {
      console.error('Error saving decision:', error);
      toast.error('Failed to save decision');
    } finally {
      setSaving(false);
    }
  };

  const handleIndividualTermsChange = (decisions: IndividualTermDecision[]) => {
    setIndividualTermDecisions(decisions);
  };

  const handlePartialConsent = () => {
    setShowIndividualTerms(true);
  };

  return (
    <div className="page-transition min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/analyzer')}
            className="mb-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analyzer
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-foreground">Risk Analysis Report</h1>
              <p className="text-muted-foreground text-lg">Comprehensive analysis of consent document risks and recommendations</p>
            </div>
            <ExportButton reportData={reportData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <DocumentSummaryCard 
              documentTitle={reportData.documentTitle}
              companyName={reportData.companyName}
              riskScore={reportData.riskScore}
              summary={reportData.summaryData[0]?.content || 'Analysis complete. Review the detailed findings below.'}
            />

            {reportData.safetyInsights && (
              <SafetyInsightsCard insights={reportData.safetyInsights} />
            )}

            {reportData.individualTerms && reportData.individualTerms.length > 0 && (
              <IndividualTermsCard 
                terms={reportData.individualTerms}
                onTermsChange={handleIndividualTermsChange}
                disabled={consentDecision !== null}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ConsentDecisionCard 
              onConsent={handleSaveDecision}
              consentAction={consentDecision}
              hasIndividualTerms={reportData.individualTerms && reportData.individualTerms.length > 0}
              onIndividualTermsChange={handleIndividualTermsChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskReport;
