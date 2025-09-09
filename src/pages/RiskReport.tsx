
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

const RiskReport: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consentDecision, setConsentDecision] = useState<'allow' | 'partial' | 'deny' | null>(null);
  const [saving, setSaving] = useState(false);

  // Generate analysis based on the input text
  const generateAnalysis = (text: string) => {
    const consentText = text || location.state?.consentText || "";
    const textLength = consentText.length;
    const keywordAnalysis = {
      privacy: (consentText.toLowerCase().match(/privacy|personal|data|information/g) || []).length,
      sharing: (consentText.toLowerCase().match(/share|third.?party|partner|advertis/g) || []).length,
      tracking: (consentText.toLowerCase().match(/track|cookie|analytics|monitor/g) || []).length,
      rights: (consentText.toLowerCase().match(/right|opt.?out|delete|control/g) || []).length,
    };

    // Calculate risk score based on content analysis
    const baseScore = Math.min(100, Math.max(20, 
      (keywordAnalysis.privacy * 3) + 
      (keywordAnalysis.sharing * 4) + 
      (keywordAnalysis.tracking * 3) + 
      Math.max(0, 50 - (keywordAnalysis.rights * 8))
    ));

    // Determine document title from content
    const getDocumentTitle = (text: string): string => {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.length > 5 && firstLine.length < 100) {
          return firstLine;
        }
      }
      
      if (text.toLowerCase().includes('terms of service') || text.toLowerCase().includes('terms and conditions')) {
        return "Terms of Service Agreement";
      } else if (text.toLowerCase().includes('privacy policy')) {
        return "Privacy Policy Document";
      } else if (text.toLowerCase().includes('cookie')) {
        return "Cookie Policy";
      } else {
        return "Consent Agreement Document";
      }
    };

    const riskItems: RiskItem[] = [];
    const summaryData: SummarySection[] = [];

    // Generate risk items based on analysis
    if (keywordAnalysis.privacy > 3) {
      riskItems.push({
        clause: "Data Collection and Usage",
        risk: "Extensive personal data collection identified in the document",
        impact: keywordAnalysis.privacy > 8 ? "High privacy invasion with potential for data profiling" : "Moderate privacy concerns with personal data usage",
        recommendation: "Review specific data collection purposes and request opt-out options"
      });

      summaryData.push({
        title: "Data Collection Practices",
        content: `The document contains ${keywordAnalysis.privacy} references to personal data collection. This suggests significant data processing activities that users should be aware of.`,
        riskLevel: keywordAnalysis.privacy > 8 ? "high" : keywordAnalysis.privacy > 5 ? "medium" : "low"
      });
    }

    if (keywordAnalysis.sharing > 2) {
      riskItems.push({
        clause: "Third-Party Data Sharing",
        risk: "Document allows sharing of data with external parties",
        impact: keywordAnalysis.sharing > 6 ? "Loss of control over personal information with unknown recipients" : "Limited data sharing with potential privacy implications",
        recommendation: "Demand transparency about third-party partners and sharing purposes"
      });

      summaryData.push({
        title: "Third-Party Integration",
        content: `Found ${keywordAnalysis.sharing} instances of third-party data sharing provisions. This indicates your data may be shared beyond the primary service provider.`,
        riskLevel: keywordAnalysis.sharing > 6 ? "high" : keywordAnalysis.sharing > 3 ? "medium" : "low"
      });
    }

    if (keywordAnalysis.tracking > 2) {
      riskItems.push({
        clause: "Tracking and Analytics",
        risk: "Implementation of tracking technologies and user monitoring",
        impact: "Behavioral profiling and targeted advertising based on usage patterns",
        recommendation: "Seek options to disable or limit tracking mechanisms"
      });
    }

    if (keywordAnalysis.rights < 3) {
      riskItems.push({
        clause: "User Rights and Control",
        risk: "Limited user control mechanisms described in the document",
        impact: "Difficulty in managing or deleting personal information",
        recommendation: "Request clear procedures for exercising data rights"
      });

      summaryData.push({
        title: "User Rights and Control",
        content: `The document provides limited information about user rights (${keywordAnalysis.rights} references). This may indicate restricted control over your personal data.`,
        riskLevel: keywordAnalysis.rights === 0 ? "high" : "medium"
      });
    }

    // Ensure we have at least some analysis
    if (riskItems.length === 0) {
      riskItems.push({
        clause: "General Terms Analysis",
        risk: "Standard consent document with typical data usage provisions",
        impact: "Basic privacy considerations apply",
        recommendation: "Review the document carefully for any concerning clauses"
      });
    }

    if (summaryData.length === 0) {
      summaryData.push({
        title: "Document Analysis",
        content: "This appears to be a standard consent document. While no major red flags were identified, users should still review the terms carefully.",
        riskLevel: "low" as const
      });
    }

    return {
      documentTitle: getDocumentTitle(consentText),
      riskScore: Math.round(baseScore),
      riskItems,
      summaryData,
      originalText: consentText || "No document text provided"
    };
  };

  const analysisData = generateAnalysis(location.state?.consentText || "");

  const handleSaveDecision = async (decision: 'allow' | 'partial' | 'deny') => {
    if (!user) {
      toast.error('Please sign in to save your decision');
      return;
    }

    setConsentDecision(decision);
    setSaving(true);

    try {
      // Save the consent analysis to database - convert arrays to JSON
      const analysisDataToSave = {
        user_id: user.id,
        document_title: analysisData.documentTitle,
        risk_score: analysisData.riskScore,
        consent_decision: decision,
        risk_items: JSON.stringify(analysisData.riskItems),
        summary_sections: JSON.stringify(analysisData.summaryData),
        original_text: analysisData.originalText
      };

      const { error: insertError } = await supabase
        .from('consent_analyses')
        .insert(analysisDataToSave);

      if (insertError) {
        console.error('Error saving analysis:', insertError);
        toast.error('Failed to save analysis');
        return;
      }

      // Update user stats - first get current stats or create if doesn't exist
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Initialize stats for new users starting from 0
      const currentTotalAnalyses = currentStats?.total_analyses || 0;
      const currentHighRiskAnalyses = currentStats?.high_risk_analyses || 0;
      const currentAvgScore = currentStats?.average_risk_score || 0;
      const currentConsentDecisions = currentStats?.consent_decisions_count || 0;

      const newTotalAnalyses = currentTotalAnalyses + 1;
      const newHighRiskAnalyses = analysisData.riskScore > 70 
        ? currentHighRiskAnalyses + 1 
        : currentHighRiskAnalyses;
      const newConsentDecisions = currentConsentDecisions + 1;
      
      // Calculate new average score properly
      const newAvgScore = currentTotalAnalyses === 0 
        ? analysisData.riskScore 
        : Math.round(((currentAvgScore * currentTotalAnalyses) + analysisData.riskScore) / newTotalAnalyses);

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
              title: analysisData.documentTitle,
              action: decision,
              timestamp: new Date().toISOString(),
              riskScore: analysisData.riskScore
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
            <ExportButton reportData={analysisData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <RiskScoreCard 
              riskScore={analysisData.riskScore}
            />
            
            <DocumentAnalysisCard 
              risks={analysisData.riskItems.map((item, index) => ({
                id: `risk-${index}`,
                title: item.clause,
                description: item.risk,
                severity: analysisData.riskScore > 80 ? 'high' : analysisData.riskScore > 60 ? 'medium' : 'low',
                category: 'Privacy',
                specific_clause: item.clause,
                impact: item.impact,
                recommendation: item.recommendation
              }))}
            />
            
            <RiskItemsList risks={analysisData.riskItems.map((item, index) => ({
              id: `risk-${index}`,
              title: item.clause,
              description: item.risk,
              severity: analysisData.riskScore > 80 ? 'high' : analysisData.riskScore > 60 ? 'medium' : 'low',
              category: 'Privacy',
              specific_clause: item.clause,
              impact: item.impact,
              recommendation: item.recommendation
            }))} />
            
            <DetailedAnalysis summary={analysisData.summaryData.map(section => ({
              title: section.title,
              content: section.content,
              risk_level: section.riskLevel,
              specific_issues: [
                "Document analysis based on content keywords",
                "Risk assessment derived from clause patterns", 
                "Recommendations tailored to identified concerns"
              ]
            }))} />
            
            <OriginalDocument consentText={analysisData.originalText} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ConsentDecisionCard 
              onConsent={handleSaveDecision}
              consentAction={consentDecision}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskReport;
