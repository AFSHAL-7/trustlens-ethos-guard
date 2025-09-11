
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileText, Send, ArrowRight, ArrowLeft } from 'lucide-react';

const ConsentAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [consentText, setConsentText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Simulate file reading delay
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setConsentText(event.target.result as string);
            setIsUploading(false);
            toast.success(`File "${file.name}" uploaded successfully`);
          }
        };
        reader.onerror = () => {
          setIsUploading(false);
          toast.error('Error reading file');
        };
        reader.readAsText(file);
      }, 1000);
    }
  };

  const handleAnalyze = () => {
    if (!consentText.trim()) {
      toast.error('Please enter or upload consent text to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
      // Navigate to the risk report page with the consent text
      navigate('/report', { state: { consentText } });
    }, 2500);
  };

  return (
    <div className="page-transition">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Consent Analyzer</h1>
        <p className="text-gray-600">Upload or paste terms and conditions for AI-powered analysis</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Input Document</CardTitle>
            <CardDescription>
              Paste terms and conditions or upload a file to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Paste your terms and conditions or privacy policy here..."
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              className="min-h-[300px] p-4 text-base"
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.pdf,.docx" 
              onChange={handleFileChange}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={handleFileUpload}
              disabled={isUploading || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-t-2 border-b-2 border-trustlens-blue rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
            
            <Button
              onClick={handleAnalyze}
              disabled={isUploading || isAnalyzing || !consentText.trim()}
              className="flex items-center gap-2 bg-trustlens-blue hover:bg-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <FileText className="h-4 w-4 text-trustlens-blue" />
              </div>
              <div>
                <h3 className="font-medium mb-1">1. Provide Content</h3>
                <p className="text-sm text-gray-600">
                  Upload a document or paste text containing terms and conditions
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Send className="h-4 w-4 text-trustlens-blue" />
              </div>
              <div>
                <h3 className="font-medium mb-1">2. Start Analysis</h3>
                <p className="text-sm text-gray-600">
                  Click analyze to process the document with our AI
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <ArrowRight className="h-4 w-4 text-trustlens-blue" />
              </div>
              <div>
                <h3 className="font-medium mb-1">3. Review Findings</h3>
                <p className="text-sm text-gray-600">
                  Get simplified explanations and risk assessments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default ConsentAnalyzer;
