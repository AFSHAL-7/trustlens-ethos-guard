
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
        .insert({
          user_id: user.id,
          document_title: 'Privacy Policy and Terms of Service',
          risk_score: riskScore,
          consent_decision: decision,
          risk_items: risks,
          summary_sections: summary,
          original_text: consentText
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving analysis:', error);
        toast.error('Failed to save analysis');
        return null;
      }

      // Update user stats
      const { error: statsError } = await supabase.rpc('increment_user_stats', {
        user_id: user.id,
        new_risk_score: riskScore,
        is_high_risk: riskScore >= 80
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

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-400';
      case 'low': return 'bg-yellow-300';
      default: return 'bg-gray-400';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Document Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Document Type:</span>
                <span className="text-sm font-medium">Privacy Policy & Terms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Risk Items Found:</span>
                <span className="text-sm font-medium">{risks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">High Risk Issues:</span>
                <span className="text-sm font-medium text-red-600">
                  {risks.filter(r => r.severity === 'high').length}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Analyzed on {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 bg-gradient-to-r from-blue-50 to-blue-100 border-none">
          <CardHeader>
            <CardTitle>Your Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-trustlens-green hover:bg-green-600 flex justify-between items-center" 
              onClick={() => handleConsent('allow')}
              disabled={consentAction !== null}
            >
              <span>Accept All Terms</span>
              <Check className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-orange-400 text-orange-600 hover:bg-orange-50 flex justify-between items-center" 
              onClick={() => handleConsent('partial')}
              disabled={consentAction !== null}
            >
              <span>Partial Consent</span>
              <AlertTriangle className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-red-400 text-red-600 hover:bg-red-50 flex justify-between items-center" 
              onClick={() => handleConsent('deny')}
              disabled={consentAction !== null}
            >
              <span>Reject Terms</span>
              <Info className="h-5 w-5" />
            </Button>
          </CardContent>
          {consentAction && (
            <CardFooter>
              <p className="text-sm text-gray-600 italic">
                {consentAction === 'allow' 
                  ? 'Full consent granted. Saving analysis...' 
                  : consentAction === 'partial'
                    ? 'Partial consent granted. Saving analysis...'
                    : 'Consent denied. Saving analysis...'}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="risks">Specific Risk Issues</TabsTrigger>
          <TabsTrigger value="summary">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="original">Original Document</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risks" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Problematic Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {risks.map((risk) => (
                  <div key={risk.id} className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full ${getRiskColor(risk.severity)} mr-3`} />
                        <h3 className="font-semibold text-lg">{risk.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityBadgeColor(risk.severity)}`}>
                          {risk.severity.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
                          {risk.category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 pl-6">{risk.description}</p>
                    
                    <div className="pl-6 space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <h4 className="font-medium text-red-800 mb-1">Problematic Clause:</h4>
                        <p className="text-sm text-red-700 italic">{risk.specific_clause}</p>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <h4 className="font-medium text-orange-800 mb-1">Potential Impact:</h4>
                        <p className="text-sm text-orange-700">{risk.impact}</p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-medium text-blue-800 mb-1">Our Recommendation:</h4>
                        <p className="text-sm text-blue-700">{risk.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {risks.length === 0 && (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium">No significant risks detected</p>
                    <p className="text-gray-600">This document appears to follow privacy best practices</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-trustlens-blue" />
                Detailed Privacy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {summary.map((section, index) => (
                  <div key={index} className="pb-6 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{section.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityBadgeColor(section.risk_level)}`}>
                        {section.risk_level.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{section.content}</p>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Specific Issues Identified:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {section.specific_issues.map((issue, issueIndex) => (
                          <li key={issueIndex} className="text-sm text-gray-600">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="original" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-gray-500" />
                Original Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap font-mono text-sm text-gray-800 max-h-96 overflow-y-auto">
                {consentText || 'No document text available. Please return to the analyzer.'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskReport;
