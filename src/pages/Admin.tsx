
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Copy } from 'lucide-react';

const Admin: React.FC = () => {
  const { settings, loading, updateSettings } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    enable_analytics: true,
    email_notifications: true,
    risk_threshold: 75,
    enhanced_privacy_analysis: true,
    gdpr_compliance_check: true,
    ccpa_compliance_check: false,
    webhook_url: ''
  });

  // Update form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        contact_email: settings.contact_email || '',
        enable_analytics: settings.enable_analytics,
        email_notifications: settings.email_notifications,
        risk_threshold: settings.risk_threshold,
        enhanced_privacy_analysis: settings.enhanced_privacy_analysis,
        gdpr_compliance_check: settings.gdpr_compliance_check,
        ccpa_compliance_check: settings.ccpa_compliance_check,
        webhook_url: settings.webhook_url || ''
      });
    }
  }, [settings]);
  
  const handleSaveSettings = async () => {
    setIsLoading(true);
    const success = await updateSettings(formData);
    setIsLoading(false);
  };

  const copyApiKey = () => {
    if (settings?.api_key) {
      navigator.clipboard.writeText(settings.api_key);
      toast.success('API key copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="page-transition">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Configure your preferences and integrations</p>
      </div>
      
      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">General</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <Input 
                    placeholder="Your Company Name" 
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Email
                  </label>
                  <Input 
                    type="email"
                    placeholder="contact@example.com" 
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Analytics</p>
                    <p className="text-sm text-gray-500">Collect anonymous usage data</p>
                  </div>
                  <Switch 
                    checked={formData.enable_analytics}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_analytics: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send consent activity updates</p>
                  </div>
                  <Switch 
                    checked={formData.email_notifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_notifications: checked }))}
                  />
                </div>
                
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
            
          </div>
        </TabsContent>
        
        <TabsContent value="api" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
              <CardDescription>Manage your API keys and integration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <div className="flex">
                  <Input 
                    type="password"
                    value={settings?.api_key || 'Loading...'}
                    className="flex-1 mr-2"
                    readOnly
                  />
                  <Button variant="outline" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This key provides access to the TrustLens API
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Webhook URL
                </label>
                <Input 
                  placeholder="https://your-app.com/webhook/trustlens" 
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send consent events to this URL
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Webhook Events</h3>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">consent.created</p>
                  <Switch 
                    checked={settings?.webhook_consent_created || false}
                    onCheckedChange={(checked) => updateSettings({ webhook_consent_created: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">consent.updated</p>
                  <Switch 
                    checked={settings?.webhook_consent_updated || false}
                    onCheckedChange={(checked) => updateSettings({ webhook_consent_updated: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">risk.detected</p>
                  <Switch 
                    checked={settings?.webhook_risk_detected || false}
                    onCheckedChange={(checked) => updateSettings({ webhook_risk_detected: checked })}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Saving...' : 'Save API Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Customize AI analysis preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Risk Score Threshold
                </label>
                <div className="flex items-center">
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={formData.risk_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, risk_threshold: Number(e.target.value) }))}
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Consent documents scoring above this threshold will be flagged as high risk
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enhanced Privacy Analysis</p>
                  <p className="text-sm text-gray-500">More thorough privacy evaluation</p>
                </div>
                <Switch 
                  checked={formData.enhanced_privacy_analysis}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enhanced_privacy_analysis: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">GDPR Compliance Check</p>
                  <p className="text-sm text-gray-500">Check terms against GDPR requirements</p>
                </div>
                <Switch 
                  checked={formData.gdpr_compliance_check}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdpr_compliance_check: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">CCPA Compliance Check</p>
                  <p className="text-sm text-gray-500">Check terms against CCPA requirements</p>
                </div>
                <Switch 
                  checked={formData.ccpa_compliance_check}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ccpa_compliance_check: checked }))}
                />
              </div>
              
              <Button 
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Saving...' : 'Save AI Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
