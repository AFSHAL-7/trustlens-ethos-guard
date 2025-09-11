
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const Admin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveSettings = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };
  
  return (
    <div className="page-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-600">Configure settings and manage integrations</p>
      </div>
      
      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
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
                    defaultValue="TrustLens Inc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Email
                  </label>
                  <Input 
                    type="email"
                    placeholder="contact@example.com" 
                    defaultValue="support@trustlens.com"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Analytics</p>
                    <p className="text-sm text-gray-500">Collect anonymous usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send consent activity updates</p>
                  </div>
                  <Switch defaultChecked />
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
                      defaultValue="75"
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
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">GDPR Compliance Check</p>
                    <p className="text-sm text-gray-500">Check terms against GDPR requirements</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CCPA Compliance Check</p>
                    <p className="text-sm text-gray-500">Check terms against CCPA requirements</p>
                  </div>
                  <Switch />
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
                    value="sk_test_TrustLens2025ApiKeyExampleValue"
                    className="flex-1 mr-2"
                    readOnly
                  />
                  <Button variant="outline" onClick={() => toast.success('API key copied to clipboard')}>
                    Copy
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
                  defaultValue="https://api.example.com/webhooks/trustlens"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send consent events to this URL
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Webhook Events</h3>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">consent.created</p>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">consent.updated</p>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">risk.detected</p>
                  <Switch defaultChecked />
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
        
        <TabsContent value="users" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-3 text-sm">Sarah Johnson</td>
                      <td className="px-4 py-3 text-sm">sarah@example.com</td>
                      <td className="px-4 py-3 text-sm">Admin</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Michael Chen</td>
                      <td className="px-4 py-3 text-sm">michael@example.com</td>
                      <td className="px-4 py-3 text-sm">User</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Alex Smith</td>
                      <td className="px-4 py-3 text-sm">alex@example.com</td>
                      <td className="px-4 py-3 text-sm">User</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          Invited
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button variant="outline" className="mr-2">
                  Invite User
                </Button>
                <Button>
                  Manage Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
