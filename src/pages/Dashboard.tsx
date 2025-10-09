import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, AlertTriangle, XCircle, Search, TrendingUp, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface ConsentRecord {
  id: string;
  title: string;
  action: 'allow' | 'partial' | 'deny';
  timestamp: string;
  riskScore: number;
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, stats, loading, error } = useUserProfile();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  
  const [chartData, setChartData] = useState<Array<{name: string, allow: number, partial: number, deny: number}>>([]);
  
  // Load real consent analyses from database and generate chart data
  useEffect(() => {
    const loadConsentHistory = async () => {
      if (!user) return;
      
      try {
        const { data: analyses, error } = await supabase
          .from('consent_analyses')
          .select('id, document_title, consent_decision, risk_score, created_at, analyzed_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error loading consent history:', error);
          return;
        }
        
        if (analyses) {
          const consentRecords: ConsentRecord[] = analyses.map(analysis => ({
            id: analysis.id,
            title: analysis.document_title,
            action: analysis.consent_decision as 'allow' | 'partial' | 'deny',
            timestamp: analysis.created_at || analysis.analyzed_at || new Date().toISOString(),
            riskScore: analysis.risk_score
          }));
          
          setConsents(consentRecords);
          
          // Generate chart data from actual analyses by day (last 7 days)
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
          });
          
          const chartDataByDay = last7Days.map(day => {
            const dayAnalyses = analyses.filter(a => {
              const analysisDate = new Date(a.created_at || a.analyzed_at || '').toISOString().split('T')[0];
              return analysisDate === day;
            });
            
            return {
              name: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              allow: dayAnalyses.filter(a => a.consent_decision === 'allow').length,
              partial: dayAnalyses.filter(a => a.consent_decision === 'partial').length,
              deny: dayAnalyses.filter(a => a.consent_decision === 'deny').length,
            };
          });
          
          setChartData(chartDataByDay);
        }
      } catch (error) {
        console.error('Error loading consent history:', error);
      }
    };
    
    loadConsentHistory();
    
    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('consent-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consent_analyses',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Real-time update: Consent data changed');
          loadConsentHistory();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Add new consent if passed from Risk Report
  useEffect(() => {
    const newConsent = location.state?.newConsent;
    
    if (newConsent) {
      const consentRecord: ConsentRecord = {
        id: Date.now().toString(), // Use timestamp as ID to avoid conflicts
        title: newConsent.title,
        action: newConsent.action,
        timestamp: newConsent.timestamp,
        riskScore: newConsent.riskScore
      };
      
      setConsents(prev => [consentRecord, ...prev]);
      
      // Clear location state to avoid duplication on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const getActionIcon = (action: string) => {
    switch(action) {
      case 'allow': return <Check className="h-5 w-5 text-trustlens-green" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'deny': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredConsents = (filterType: 'all' | 'allow' | 'partial' | 'deny') => {
    if (filterType === 'all') return consents;
    return consents.filter(consent => consent.action === filterType);
  };

  const handleViewReport = (consentId: string) => {
    navigate(`/report/${consentId}`);
  };

  const renderConsentList = (filteredConsents: ConsentRecord[]) => {
    if (filteredConsents.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium">No consent records found</p>
          <p className="text-gray-600">Records will appear here when you analyze documents</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredConsents.map((consent) => (
          <div 
            key={consent.id}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleViewReport(consent.id)}
          >
            <div className="flex items-center">
              <div className="mr-4">
                {getActionIcon(consent.action)}
              </div>
              <div>
                <h3 className="font-medium">{consent.title}</h3>
                <p className="text-sm text-gray-500">{formatDate(consent.timestamp)}</p>
              </div>
            </div>
            <div className="text-right">
              <div 
                className={`inline-block text-sm font-medium px-2 py-1 rounded-full ${
                  consent.riskScore > 80
                    ? 'bg-red-100 text-red-700'
                    : consent.riskScore > 60
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                Risk Score: {consent.riskScore}%
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.full_name || user?.email || 'User'}!</p>
      </div>
      
      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              Total Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : stats?.total_analyses || 0}
            </div>
            <p className="text-sm text-gray-500">Documents analyzed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : stats?.high_risk_analyses || 0}
            </div>
            <p className="text-sm text-gray-500">High risk documents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : stats?.average_risk_score || 0}%
            </div>
            <p className="text-sm text-gray-500">Average risk level</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <div className="bg-purple-100 p-2 rounded-full mr-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : stats?.consent_decisions_count || 0}
            </div>
            <p className="text-sm text-gray-500">Consent decisions made</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-2">
                <Check className="h-5 w-5 text-trustlens-green" />
              </div>
              Allowed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {consents.filter(c => c.action === 'allow').length}
            </div>
            <p className="text-sm text-gray-500">Total full consents granted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <div className="bg-orange-100 p-2 rounded-full mr-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              Partial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {consents.filter(c => c.action === 'partial').length}
            </div>
            <p className="text-sm text-gray-500">Total partial consents granted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-2">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {consents.filter(c => c.action === 'deny').length}
            </div>
            <p className="text-sm text-gray-500">Total consents denied</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Consent Trends</CardTitle>
          <CardDescription>Your consent decisions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="allow" 
                  name="Allow" 
                  stroke="#28a745" 
                  strokeWidth={2} 
                  dot={{ strokeWidth: 2 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="partial" 
                  name="Partial" 
                  stroke="#fd7e14" 
                  strokeWidth={2} 
                  dot={{ strokeWidth: 2 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="deny" 
                  name="Deny" 
                  stroke="#dc3545" 
                  strokeWidth={2} 
                  dot={{ strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Consent History</CardTitle>
          <CardDescription>Record of your past consent decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="allow">Allowed</TabsTrigger>
              <TabsTrigger value="partial">Partial</TabsTrigger>
              <TabsTrigger value="deny">Denied</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="animate-fade-in">
              {renderConsentList(getFilteredConsents('all'))}
            </TabsContent>
            
            <TabsContent value="allow" className="animate-fade-in">
              {renderConsentList(getFilteredConsents('allow'))}
            </TabsContent>
            
            <TabsContent value="partial" className="animate-fade-in">
              {renderConsentList(getFilteredConsents('partial'))}
            </TabsContent>
            
            <TabsContent value="deny" className="animate-fade-in">
              {renderConsentList(getFilteredConsents('deny'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
