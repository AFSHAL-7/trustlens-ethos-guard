
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileText, Send, ArrowRight, File, Image } from 'lucide-react';
import { analyzeConsentDocument } from '@/services/analysisService';

const ConsentAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [consentText, setConsentText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadedFile(file);
      
      try {
        // Handle different file types
        if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
          // Text files - read directly
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const content = event.target.result as string;
              setConsentText(content);
              setDocumentPreview(content.substring(0, 500) + '...');
              setIsUploading(false);
              toast.success(`File "${file.name}" uploaded successfully`);
            }
          };
          reader.readAsText(file);
        } else if (file.type.startsWith('image/')) {
          // Image files - show preview
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setDocumentPreview(event.target.result as string);
              setConsentText(`[Image uploaded: ${file.name}]`);
              setIsUploading(false);
              toast.success(`Image "${file.name}" uploaded successfully`);
            }
          };
          reader.readAsDataURL(file);
        } else {
          // Other file types (PDF, DOCX, etc.) - show file info
          setDocumentPreview(`Document: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
          setConsentText(`[Document uploaded: ${file.name}]`);
          setIsUploading(false);
          toast.success(`Document "${file.name}" uploaded successfully`);
        }
      } catch (error) {
        setIsUploading(false);
        toast.error('Error processing file');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!consentText.trim()) {
      toast.error('Please enter or upload consent text to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Perform actual AI analysis
      const analysisResult = await analyzeConsentDocument(consentText);
      
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
      
      // Navigate to the risk report page with analysis results
      navigate('/report', { 
        state: { 
          analysisResult,
          originalText: consentText
        } 
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      toast.error('Analysis failed. Please try again.');
    }
  };

  return (
    <div className="page-transition">
      <div className="mb-6">
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
              onChange={handleFileChange}
            />
            
            {/* Document Preview Section */}
            {documentPreview && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  {uploadedFile?.type.startsWith('image/') ? (
                    <Image className="h-4 w-4 text-primary" />
                  ) : (
                    <File className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">Document Preview</span>
                </div>
                {uploadedFile?.type.startsWith('image/') ? (
                  <img 
                    src={documentPreview} 
                    alt="Uploaded document" 
                    className="max-w-full h-auto max-h-48 rounded border object-contain"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {documentPreview}
                  </div>
                )}
              </div>
            )}
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
                  Upload any document type (PDF, DOCX, images, text) or paste content directly
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
