
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
  const [uploadedFileData, setUploadedFileData] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [analysisTime, setAnalysisTime] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClearDocument = () => {
    setUploadedFile(null);
    setUploadedFileData('');
    setDocumentPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Document cleared');
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
              setUploadedFileData(`TEXT_DATA:${content}`);
              setDocumentPreview(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
              setIsUploading(false);
              toast.success(`File "${file.name}" uploaded and ready for analysis`);
            }
          };
          reader.readAsText(file);
        } else if (file.type.startsWith('image/')) {
          // Image files - store as base64 for AI vision analysis
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const base64Data = event.target.result as string;
              setDocumentPreview(base64Data);
              setUploadedFileData(`IMAGE_DATA:${base64Data}`);
              setIsUploading(false);
              toast.success(`Image "${file.name}" uploaded - will be analyzed using OCR`);
            }
          };
          reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          // PDF files - will be processed by backend
          const reader = new FileReader();
          reader.onload = async (event) => {
            if (event.target?.result) {
              const base64Data = (event.target.result as string).split(',')[1];
              setDocumentPreview(`PDF Document: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
              setUploadedFileData(`PDF_DATA:${base64Data}:${file.name}`);
              setIsUploading(false);
              toast.success(`PDF "${file.name}" uploaded - will extract text for analysis`);
            }
          };
          reader.readAsDataURL(file);
        } else {
          // Other file types
          const reader = new FileReader();
          reader.onload = async (event) => {
            if (event.target?.result) {
              const base64Data = (event.target.result as string).split(',')[1];
              setDocumentPreview(`Document: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
              setUploadedFileData(`DOC_DATA:${base64Data}:${file.name}`);
              setIsUploading(false);
              toast.success(`Document "${file.name}" uploaded - will extract text for analysis`);
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        setIsUploading(false);
        toast.error('Error processing file');
      }
    }
  };

  const handleAnalyze = async () => {
    // Check if user has either uploaded a file or entered text
    const hasUploadedFile = uploadedFileData.trim();
    const hasTextInput = consentText.trim();
    
    if (!hasUploadedFile && !hasTextInput) {
      toast.error('Please enter or upload consent text to analyze');
      return;
    }

    setIsAnalyzing(true);
    const estimatedTime = 25; // Estimate 25 seconds for analysis
    setAnalysisTime(estimatedTime);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setAnalysisTime(prev => Math.max(0, prev - 0.1));
    }, 100);
    
    const startTime = Date.now();
    
    try {
      // Use uploaded file data if available, otherwise use text input
      const dataToAnalyze = hasUploadedFile ? uploadedFileData : consentText;
      
      // Perform actual AI analysis
      const analysisResult = await analyzeConsentDocument(dataToAnalyze);
      
      const actualTime = ((Date.now() - startTime) / 1000);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsAnalyzing(false);
      toast.success(`Analysis complete in ${actualTime.toFixed(1)}s!`);
      
      // Navigate to the risk report page with analysis results
      navigate('/report', { 
        state: { 
          analysisResult,
          originalText: dataToAnalyze
        } 
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsAnalyzing(false);
      
      // Check if error message indicates non-T&C document
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="page-transition relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Consent Analyzer</h1>
        <p className="text-gray-600">Upload or paste terms and conditions for AI-powered analysis</p>
      </div>
      
      {/* Analysis Timer - Bottom Right */}
      {isAnalyzing && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in z-50">
          <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm font-medium">
            {analysisTime > 0 ? `Time remaining: ~${analysisTime.toFixed(1)}s` : 'Finalizing...'}
          </div>
        </div>
      )}
      
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {uploadedFile?.type.startsWith('image/') ? (
                      <Image className="h-4 w-4 text-primary" />
                    ) : (
                      <File className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">Document Preview</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDocument}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
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
              disabled={isUploading || isAnalyzing || (!consentText.trim() && !uploadedFileData.trim())}
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
