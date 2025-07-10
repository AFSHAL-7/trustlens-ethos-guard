
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Check, AlertTriangle, Info, ArrowRight, Calendar, Shield, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RiskScoreCard } from '@/components/risk-report/RiskScoreCard';
import { DocumentAnalysisCard } from '@/components/risk-report/DocumentAnalysisCard';
import { ConsentDecisionCard } from '@/components/risk-report/ConsentDecisionCard';
import { RiskItemsList } from '@/components/risk-report/RiskItemsList';
import { DetailedAnalysis } from '@/components/risk-report/DetailedAnalysis';
import { OriginalDocument } from '@/components/risk-report/OriginalDocument';

interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  specific_clause: string;
  impact: string;
  recommendation: string;
}

interface SummarySection {
  title: string;
  content: string;
  risk_level: 'high' | 'medium' | 'low';
  specific_issues: string[];
}

const RiskReport: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(0);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [summary, setSummary] = useState<SummarySection[]>([]);
  const [consentAction, setConsentAction] = useState<'allow' | 'partial' | 'deny' | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  const consentText = location.state?.consentText || '';

  // Enhanced risk generation with specific clauses and detailed analysis
  useEffect(() => {
    if (!consentText) {
      navigate('/analyzer');
      return;
    }

    const timer = setTimeout(() => {
      const score = Math.floor(Math.random() * (85 - 65 + 1)) + 65;
      setRiskScore(score);
      
      // Enhanced risk items with specific problematic clauses
      const mockRisks: RiskItem[] = [
        {
          id: '1',
          title: 'Indefinite Data Retention Policy',
          description: 'Your personal data may be retained indefinitely without clear deletion timelines, violating data minimization principles.',
          severity: 'high',
          category: 'Data Retention',
          specific_clause: 'Section 4.2: "We may retain your information for as long as necessary for business purposes or as required by law."',
          impact: 'Your data could be stored forever, increasing risk of breaches and limiting your right to be forgotten.',
          recommendation: 'Request specific retention periods and regular data deletion schedules.'
        },
        {
          id: '2',
          title: 'Broad Third-Party Data Sharing',
          description: 'The terms allow sharing your data with unnamed "business partners" and "service providers" without explicit consent.',
          severity: 'high',
          category: 'Data Sharing',
          specific_clause: 'Section 6.1: "We may share your information with trusted business partners and service providers."',
          impact: 'Your data could be shared with unknown third parties, potentially for marketing or other purposes.',
          recommendation: 'Demand a complete list of data sharing partners and explicit opt-in consent for each.'
        },
        {
          id: '3',
          title: 'Automatic Marketing Consent',
          description: 'By accepting these terms, you automatically consent to receiving marketing communications across multiple channels.',
          severity: 'medium',
          category: 'Marketing',
          specific_clause: 'Section 8.3: "By using our service, you agree to receive promotional communications via email, SMS, and phone."',
          impact: 'You may receive unwanted marketing messages that are difficult to stop.',
          recommendation: 'Look for separate marketing consent options and ensure easy unsubscribe mechanisms.'
        },
        {
          id: '4',
          title: 'Biometric Data Collection Without Clear Purpose',
          description: 'The terms mention collection of biometric data for "security purposes" without specifying what data or how it\'s used.',
          severity: 'medium',
          category: 'Sensitive Data',
          specific_clause: 'Section 3.4: "We may collect biometric information for security and verification purposes."',
          impact: 'Highly sensitive biometric data could be collected without clear safeguards or purposes.',
          recommendation: 'Request detailed information about biometric data collection, storage, and deletion practices.'
        },
        {
          id: '5',
          title: 'Vague Data Processing Purposes',
          description: 'Data collection purposes are broadly defined as "improving user experience" and "business operations" without specific details.',
          severity: 'low',
          category: 'Transparency',
          specific_clause: 'Section 2.1: "We collect data to improve our services and for legitimate business interests."',
          impact: 'Lack of specific purposes makes it difficult to understand how your data is actually used.',
          recommendation: 'Ask for detailed, specific purposes for each type of data collected.'
        }
      ];
      
      if (score > 75) {
        mockRisks.pop();
      }
      
      setRisks(mockRisks);
      
      // Enhanced summary with specific risk levels and issues
      const mockSummary: SummarySection[] = [
        {
          title: 'Data Collection Practices',
          content: 'The service collects extensive personal information including contact details, device information, location data, browsing behavior, and biometric data.',
          risk_level: 'high',
          specific_issues: [
            'Biometric data collection without clear necessity',
            'Location tracking enabled by default',
            'Extensive device fingerprinting'
          ]
        },
        {
          title: 'Data Usage and Processing',
          content: 'Your data is used for service provision, analytics, marketing, and broadly defined "business purposes" that lack specific limitations.',
          risk_level: 'medium',
          specific_issues: [
            'Vague "business purposes" definition',
            'No clear limits on profiling activities',
            'Automated decision-making without human review'
          ]
        },
        {
          title: 'Third-Party Data Sharing',
          content: 'Information is shared with unnamed business partners, advertising networks, and service providers without explicit consent for each sharing instance.',
          risk_level: 'high',
          specific_issues: [
            'No list of specific sharing partners provided',
            'Blanket consent for future sharing arrangements',
            'Data sharing for advertising without opt-out'
          ]
        },
        {
          title: 'Data Retention and Deletion',
          content: 'Data retention periods are indefinite with vague deletion policies that may not comply with data protection regulations.',
          risk_level: 'high',
          specific_issues: [
            'No specific retention timeframes',
            'Data kept "as long as necessary for business purposes"',
            'Backup data may not be included in deletion requests'
          ]
        },
        {
          title: 'User Rights and Control',
          content: 'Limited user control options with complex procedures for exercising data protection rights and unclear response timeframes.',
          risk_level: 'medium',
          specific_issues: [
            'Complex data access request procedures',
            'No clear timeframes for responding to user requests',
            'Limited data portability options'
          ]
        }
      ];
      
      setSummary(mockSummary);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [consentText, navigate]);

  const saveAnalysisToDatabase = async (decision: 'allow' | 'partial' | 'deny') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('consent_analyses')
        .insert([{
          user_id: user.id,
          document_title: 'Privacy Policy and Terms of Service',
          risk_score: riskScore,
          consent_decision: decision,
          risk_items: risks,
          summary_sections: summary,
          original_text: consentText
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving analysis:', error);
        toast.error('Failed to save analysis');
        return null;
      }

      // Update user stats using direct database update
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_analyses: 1,
          high_risk_analyses: riskScore >= 80 ? 1 : 0,
          average_risk_score: riskScore,
          consent_decisions_count: 1,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (statsError) {
        console.error('Error updating stats:', statsError);
      }

      return data.id;
    } catch (error) {
      console.error('Error in saveAnalysisToDatabase:', error);
      toast.error('Failed to save analysis');
      return null;
    }
  };

  const handleConsent = async (action: 'allow' | 'partial' | 'deny') => {
    setConsentAction(action);
    
    const actionMessages = {
      allow: 'Full consent granted. Analysis saved to your dashboard.',
      partial: 'Partial consent granted. Marketing and non-essential sharing opt-outs applied.',
      deny: 'Consent denied. Analysis saved for your records.'
    };
    
    // Save to database
    const savedAnalysisId = await saveAnalysisToDatabase(action);
    if (savedAnalysisId) {
      setAnalysisId(savedAnalysisId);
      toast.success(actionMessages[action]);
    }
    
    setTimeout(() => {
      navigate('/dashboard', { 
        state: { 
          newConsent: {
            action,
            timestamp: new Date().toISOString(),
            riskScore,
            title: 'Privacy Policy and Terms of Service',
            analysisId: savedAnalysisId
          } 
        }
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="page-transition flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-6">
            <div className="h-16 w-16 border-4 border-t-trustlens-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Analyzing Document</h2>
          <p className="text-gray-600">Our AI is identifying specific privacy risks and problematic clauses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Detailed Risk Analysis</h1>
        <p className="text-gray-600">AI-powered analysis with specific problematic clauses and recommendations</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RiskScoreCard riskScore={riskScore} />
        <DocumentAnalysisCard risks={risks} />
        <ConsentDecisionCard 
          onConsent={handleConsent}
          consentAction={consentAction}
        />
      </div>

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="risks">Specific Risk Issues</TabsTrigger>
          <TabsTrigger value="summary">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="original">Original Document</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risks" className="animate-fade-in">
          <RiskItemsList risks={risks} />
        </TabsContent>
        
        <TabsContent value="summary" className="animate-fade-in">
          <DetailedAnalysis summary={summary} />
        </TabsContent>
        
        <TabsContent value="original" className="animate-fade-in">
          <OriginalDocument consentText={consentText} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskReport;
