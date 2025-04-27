
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Check, AlertTriangle, Info, ArrowRight, Calendar } from 'lucide-react';

interface RiskReportProps {}

// Mock report data (would come from backend in real app)
interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

interface SummarySection {
  title: string;
  content: string;
}

const RiskReport: React.FC<RiskReportProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState(0);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [summary, setSummary] = useState<SummarySection[]>([]);
  const [consentAction, setConsentAction] = useState<'allow' | 'partial' | 'deny' | null>(null);
  
  // Content from analyzer page
  const consentText = location.state?.consentText || '';

  // Generate mock report data
  useEffect(() => {
    if (!consentText) {
      navigate('/analyzer');
      return;
    }

    const timer = setTimeout(() => {
      // Generate a risk score between 65 and 85
      const score = Math.floor(Math.random() * (85 - 65 + 1)) + 65;
      setRiskScore(score);
      
      // Generate mock risks based on score
      const mockRisks: RiskItem[] = [
        {
          id: '1',
          title: 'Indefinite Data Retention',
          description: 'Your data may be kept indefinitely, even after you delete your account. This limits your right to be forgotten under privacy regulations.',
          severity: 'high',
          category: 'Privacy'
        },
        {
          id: '2',
          title: 'Broad Data Sharing Terms',
          description: 'The terms allow sharing your data with unnamed third parties and "business partners" without requiring additional consent.',
          severity: 'high',
          category: 'Data Sharing'
        },
        {
          id: '3',
          title: 'Automatic Marketing Consent',
          description: 'By accepting these terms, you automatically consent to receiving marketing communications without explicit opt-in.',
          severity: 'medium',
          category: 'Marketing'
        },
        {
          id: '4',
          title: 'Biometric Data Collection',
          description: 'The terms mention collection of biometric data for identity verification, which is sensitive personal information.',
          severity: 'medium',
          category: 'Privacy'
        },
        {
          id: '5',
          title: 'Vague Purpose Limitations',
          description: 'The purposes for data collection are broadly defined, potentially allowing for uses beyond what you might expect.',
          severity: 'low',
          category: 'Transparency'
        }
      ];
      
      if (score > 75) {
        mockRisks.pop(); // Remove some risks for higher scores
      }
      
      setRisks(mockRisks);
      
      // Generate summary sections
      const mockSummary: SummarySection[] = [
        {
          title: 'Data Collection',
          content: 'The service collects extensive personal information including name, email, phone, location, device info, browsing history, payment details, and biometric data.'
        },
        {
          title: 'Data Usage',
          content: 'Your data is used for service provision, user experience improvement, marketing, feature development, and personalized recommendations/advertisements.'
        },
        {
          title: 'Data Sharing',
          content: 'Information is shared with service providers, advertisers, analytics companies, business partners, and legal authorities when required.'
        },
        {
          title: 'Data Retention',
          content: 'Data is retained indefinitely unless deletion is requested. Some information may be kept even after deletion for legal compliance and other purposes.'
        },
        {
          title: 'Consent Model',
          content: 'Consent is implied through service usage. You automatically consent to data practices and marketing communications without explicit opt-in steps.'
        }
      ];
      
      setSummary(mockSummary);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [consentText, navigate]);

  const handleConsent = (action: 'allow' | 'partial' | 'deny') => {
    setConsentAction(action);
    
    const actionMessages = {
      allow: 'Full consent granted. All data practices accepted.',
      partial: 'Partial consent granted. Marketing and non-essential data sharing opt-outs applied.',
      deny: 'Consent denied. No data will be collected or processed.'
    };
    
    toast.success(`${actionMessages[action]}`);
    
    // After a brief delay, navigate to dashboard
    setTimeout(() => {
      navigate('/dashboard', { 
        state: { 
          newConsent: {
            action,
            timestamp: new Date().toISOString(),
            riskScore,
            title: 'Privacy Policy and Terms of Service'
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

  if (loading) {
    return (
      <div className="page-transition flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-6">
            <div className="h-16 w-16 border-4 border-t-trustlens-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Analyzing Document</h2>
          <p className="text-gray-600">Our AI is breaking down the terms and identifying potential risks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Risk Report</h1>
        <p className="text-gray-600">AI-powered analysis results and consent recommendations</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Risk Score</CardTitle>
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
                ? 'High risk. Significant privacy concerns detected.' 
                : riskScore > 60 
                  ? 'Moderate risk. Some privacy concerns detected.'
                  : 'Low risk. Few privacy concerns detected.'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Document Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              This consent document is a {' '}
              <span className="font-semibold">
                Privacy Policy and Terms of Service
              </span> {' '}
              dated January 1, 2025.
            </p>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Analyzed on {new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 bg-gradient-to-r from-blue-50 to-blue-100 border-none">
          <CardHeader>
            <CardTitle>Your Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-trustlens-green hover:bg-green-600 flex justify-between items-center" 
              onClick={() => handleConsent('allow')}
              disabled={consentAction !== null}
            >
              <span>Allow All</span>
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
              <span>Deny Consent</span>
              <Info className="h-5 w-5" />
            </Button>
          </CardContent>
          {consentAction && (
            <CardFooter>
              <p className="text-sm text-gray-600 italic">
                {consentAction === 'allow' 
                  ? 'Full consent granted. Redirecting to dashboard...' 
                  : consentAction === 'partial'
                    ? 'Partial consent granted. Redirecting to dashboard...'
                    : 'Consent denied. Redirecting to dashboard...'}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="risks">Key Risks</TabsTrigger>
          <TabsTrigger value="summary">Detailed Summary</TabsTrigger>
          <TabsTrigger value="original">Original Document</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risks" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Detected Privacy Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {risks.map((risk) => (
                  <div key={risk.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full ${getRiskColor(risk.severity)} mr-3`} />
                        <h3 className="font-semibold text-lg">{risk.title}</h3>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                        {risk.category}
                      </span>
                    </div>
                    <p className="text-gray-600 pl-6">{risk.description}</p>
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
                Simplified Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {summary.map((section, index) => (
                  <div key={index} className="pb-5 border-b border-gray-100 last:border-b-0">
                    <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                    <p className="text-gray-600">{section.content}</p>
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
              <div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap font-mono text-sm text-gray-800">
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
