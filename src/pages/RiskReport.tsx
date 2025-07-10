import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, FileText, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import RiskScoreCard from '@/components/risk-report/RiskScoreCard';
import DocumentAnalysisCard from '@/components/risk-report/DocumentAnalysisCard';
import ConsentDecisionCard from '@/components/risk-report/ConsentDecisionCard';
import RiskItemsList from '@/components/risk-report/RiskItemsList';
import DetailedAnalysis from '@/components/risk-report/DetailedAnalysis';
import OriginalDocument from '@/components/risk-report/OriginalDocument';

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

const RiskReport: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consentDecision, setConsentDecision] = useState<'allow' | 'partial' | 'deny' | null>(null);
  const [saving, setSaving] = useState(false);

  const mockData = {
    documentTitle: "Social Media Platform Terms of Service",
    riskScore: 72,
    riskItems: [
      {
        clause: "Data Collection and Usage",
        risk: "Extensive personal data collection including browsing habits, location data, and social connections",
        impact: "High privacy invasion with potential for data profiling and targeted manipulation",
        recommendation: "Request specific opt-out mechanisms for non-essential data collection"
      },
      {
        clause: "Third-Party Data Sharing",
        risk: "Broad permissions to share data with unnamed third-party partners",
        impact: "Loss of control over personal information with unknown recipients",
        recommendation: "Demand transparency about third-party partners and purpose of sharing"
      },
      {
        clause: "Automated Decision Making",
        risk: "AI-driven content curation and user experience personalization",
        impact: "Potential algorithmic bias affecting content exposure and social interactions",
        recommendation: "Seek options to disable or modify automated decision-making features"
      }
    ] as RiskItem[],
    summaryData: [
      {
        title: "Data Collection Practices",
        content: "The platform collects extensive personal data including location, browsing habits, device information, and social connections. This creates a comprehensive profile that extends beyond typical usage patterns.",
        riskLevel: "high" as const
      },
      {
        title: "User Rights and Control",
        content: "Limited user control over data usage with complex opt-out procedures. Account deletion may not result in complete data removal from backup systems.",
        riskLevel: "medium" as const
      },
      {
        title: "Third-Party Integration",
        content: "Data sharing agreements with advertising networks and analytics providers. Users have minimal visibility into these partnerships and data usage.",
        riskLevel: "high" as const
      }
    ] as SummarySection[],
    originalText: location.state?.originalText || "Original document text would appear here..."
  };

  const handleSaveDecision = async (decision: 'allow' | 'partial' | 'deny') => {
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
        document_title: mockData.documentTitle,
        risk_score: mockData.riskScore,
        consent_decision: decision,
        risk_items: JSON.stringify(mockData.riskItems),
        summary_sections: JSON.stringify(mockData.summaryData),
        original_text: mockData.originalText
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
      const newHighRiskAnalyses = mockData.riskScore > 70 
        ? (currentStats?.high_risk_analyses || 0) + 1 
        : (currentStats?.high_risk_analyses || 0);
      const newConsentDecisions = (currentStats?.consent_decisions_count || 0) + 1;
      
      const currentAvgScore = currentStats?.average_risk_score || 0;
      const currentTotal = currentStats?.total_analyses || 0;
      const newAvgScore = Math.round(((currentAvgScore * currentTotal) + mockData.riskScore) / newTotalAnalyses);

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
              title: mockData.documentTitle,
              action: decision,
              timestamp: new Date().toISOString(),
              riskScore: mockData.riskScore
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

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const getRiskIcon = (score: number) => {
    if (score >= 80) return <XCircle className="h-6 w-6 text-red-600" />;
    if (score >= 60) return <AlertTriangle className="h-6 w-6 text-orange-600" />;
    return <CheckCircle className="h-6 w-6 text-green-600" />;
  };

  return (
    <div className="page-transition">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/analyzer')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analyzer
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Risk Analysis Report</h1>
            <p className="text-gray-600">Detailed analysis of consent document risks and recommendations</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <RiskScoreCard 
            riskScore={mockData.riskScore}
          />
          
          <DocumentAnalysisCard 
            risks={mockData.riskItems.map((item, index) => ({
              id: `risk-${index}`,
              title: item.clause,
              description: item.risk,
              severity: mockData.riskScore > 80 ? 'high' : mockData.riskScore > 60 ? 'medium' : 'low',
              category: 'Privacy',
              specific_clause: item.clause,
              impact: item.impact,
              recommendation: item.recommendation
            }))}
          />
          
          <RiskItemsList risks={mockData.riskItems.map((item, index) => ({
            id: `risk-${index}`,
            title: item.clause,
            description: item.risk,
            severity: mockData.riskScore > 80 ? 'high' : mockData.riskScore > 60 ? 'medium' : 'low',
            category: 'Privacy',
            specific_clause: item.clause,
            impact: item.impact,
            recommendation: item.recommendation
          }))} />
          
          <DetailedAnalysis summary={mockData.summaryData.map(section => ({
            title: section.title,
            content: section.content,
            risk_level: section.riskLevel,
            specific_issues: [
              "Extensive data collection beyond necessary functionality",
              "Unclear data retention policies",
              "Limited user control over personal information"
            ]
          }))} />
          
          <OriginalDocument consentText={mockData.originalText} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ConsentDecisionCard 
            onConsent={handleSaveDecision}
            consentAction={consentDecision}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default RiskReport;
