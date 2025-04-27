
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, AlertTriangle, XCircle, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConsentRecord {
  id: string;
  title: string;
  action: 'allow' | 'partial' | 'deny';
  timestamp: string;
  riskScore: number;
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  
  // Mock data for the chart
  const chartData = [
    { name: 'Jan', allow: 4, partial: 2, deny: 1 },
    { name: 'Feb', allow: 3, partial: 3, deny: 2 },
    { name: 'Mar', allow: 2, partial: 4, deny: 3 },
    { name: 'Apr', allow: 5, partial: 2, deny: 1 },
    { name: 'May', allow: 3, partial: 1, deny: 4 },
    { name: 'Jun', allow: 6, partial: 3, deny: 2 },
  ];
  
  // Initial mock data
  useEffect(() => {
    const initialConsents: ConsentRecord[] = [
      {
        id: '1',
        title: 'Social Media App Terms',
        action: 'partial',
        timestamp: '2025-03-15T14:30:00Z',
        riskScore: 72
      },
      {
        id: '2',
        title: 'E-commerce Website Privacy Policy',
        action: 'allow',
        timestamp: '2025-03-10T09:15:00Z',
        riskScore: 58
      },
      {
        id: '3',
        title: 'Finance App Data Sharing',
        action: 'deny',
        timestamp: '2025-03-05T16:45:00Z',
        riskScore: 89
      },
      {
        id: '4',
        title: 'Video Streaming Service Terms',
        action: 'allow',
        timestamp: '2025-02-28T11:20:00Z',
        riskScore: 62
      }
    ];
    
    setConsents(initialConsents);
  }, []);
  
  // Add new consent if passed from Risk Report
  useEffect(() => {
    const newConsent = location.state?.newConsent;
    
    if (newConsent) {
      const consentRecord: ConsentRecord = {
        id: (consents.length + 1).toString(),
        title: newConsent.title,
        action: newConsent.action,
        timestamp: newConsent.timestamp,
        riskScore: newConsent.riskScore
      };
      
      setConsents(prev => [consentRecord, ...prev]);
      
      // Clear location state to avoid duplication on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, consents.length]);
  
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

  return (
    <div className="page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">View and manage your consent decisions</p>
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
  
  function renderConsentList(filteredConsents: ConsentRecord[]) {
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
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
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
  }
};

export default Dashboard;
