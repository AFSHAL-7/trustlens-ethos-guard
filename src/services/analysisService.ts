import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  documentTitle: string;
  companyName?: string;
  riskScore: number;
  riskItems: Array<{
    clause: string;
    risk: string;
    impact: string;
    recommendation: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  summaryData: Array<{
    title: string;
    content: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  individualTerms: Array<{
    id: string;
    title: string;
    description: string;
    risk: 'low' | 'medium' | 'high';
    isRequired: boolean;
  }>;
  safetyInsights?: {
    comparisonToSafeServices: string;
    recommendedUsage: string;
    trustScore: number;
    keyWarnings: string[];
  };
}

function validateTermsAndConditions(text: string): { isValid: boolean; message?: string } {
  // Check minimum length
  if (text.trim().length < 100) {
    return {
      isValid: false,
      message: "The provided text is too short to be valid terms and conditions. Please provide a complete document."
    };
  }

  // Check for placeholder or test content
  const testPatterns = [
    /\[image uploaded:/i,
    /\[document uploaded:/i,
    /^test$/i,
    /^sample$/i,
    /lorem ipsum/i
  ];

  for (const pattern of testPatterns) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        message: "Please provide actual terms and conditions text, not file names or placeholder content."
      };
    }
  }

  // Check for legal/policy indicators
  const legalIndicators = [
    /terms?\s+(?:of\s+)?(?:service|use)/i,
    /privacy\s+policy/i,
    /user\s+agreement/i,
    /end\s+user\s+license\s+agreement/i,
    /cookie\s+policy/i,
    /data\s+(?:protection|processing)\s+(?:policy|agreement)/i,
    /acceptable\s+use\s+policy/i,
    /conditions?\s+of\s+use/i,
    /legal\s+(?:notice|agreement)/i
  ];

  const hasLegalTitle = legalIndicators.some(pattern => pattern.test(text));

  // Check for common legal/policy keywords
  const legalKeywords = [
    'agree', 'rights', 'obligation', 'liability', 'consent',
    'data', 'privacy', 'collect', 'process', 'information',
    'service', 'user', 'personal', 'policy', 'compliance',
    'protection', 'security', 'disclosure', 'jurisdiction'
  ];

  const lowerText = text.toLowerCase();
  const keywordMatches = legalKeywords.filter(keyword => lowerText.includes(keyword)).length;

  // Document should have legal title OR multiple legal keywords
  if (!hasLegalTitle && keywordMatches < 5) {
    return {
      isValid: false,
      message: "This doesn't appear to be a terms and conditions or privacy policy document. Please provide proper legal terms, privacy policy, or user agreement text."
    };
  }

  // Check for minimum structure (paragraphs or sections)
  const hasStructure = text.split('\n').filter(line => line.trim().length > 20).length >= 5;
  
  if (!hasStructure) {
    return {
      isValid: false,
      message: "The document appears incomplete. Please provide a complete terms and conditions or privacy policy with proper sections and content."
    };
  }

  return { isValid: true };
}

export const analyzeConsentDocument = async (text: string): Promise<AnalysisResult> => {
  // Check if this is image or document data
  const isImageData = text.startsWith('IMAGE_DATA:');
  const isPdfData = text.startsWith('PDF_DATA:');
  const isDocData = text.startsWith('DOC_DATA:');
  
  if (!isImageData && !isPdfData && !isDocData) {
    // Validate that the content is actually terms and conditions
    const validation = validateTermsAndConditions(text);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
  }

  try {
    // Prepare the request body
    let body: any;
    
    if (isImageData) {
      // Extract base64 image data
      const imageData = text.substring('IMAGE_DATA:'.length);
      body = { imageData, type: 'image' };
    } else if (isPdfData) {
      // Extract PDF data and filename
      const parts = text.substring('PDF_DATA:'.length).split(':');
      const pdfData = parts[0];
      const fileName = parts[1] || 'document.pdf';
      body = { pdfData, fileName, type: 'pdf' };
    } else if (isDocData) {
      // Extract document data and filename
      const parts = text.substring('DOC_DATA:'.length).split(':');
      const docData = parts[0];
      const fileName = parts[1] || 'document';
      body = { docData, fileName, type: 'document' };
    } else {
      // Regular text
      body = { text };
    }

    // Call the AI-powered analysis edge function
    const { data, error } = await supabase.functions.invoke('analyze-consent', {
      body
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Failed to analyze document");
    }

    if (!data) {
      throw new Error("No data returned from analysis");
    }

    return data as AnalysisResult;
  } catch (error) {
    console.error("Analysis error:", error);
    
    // For images and documents, we can't do fallback analysis
    if (text.startsWith('IMAGE_DATA:') || text.startsWith('PDF_DATA:') || text.startsWith('DOC_DATA:')) {
      throw error;
    }
    
    // Fallback to basic analysis if AI fails for text
    console.warn("Falling back to basic analysis");
    const documentTitle = extractDocumentTitle(text) || "Terms of Service Document";
    const riskItems = analyzeRiskItems(text);
    const summaryData = generateSummary(text, riskItems);
    const individualTerms = extractIndividualTerms(text);
    const riskScore = calculateRiskScore(riskItems, text);

    return {
      documentTitle,
      riskScore,
      riskItems,
      summaryData,
      individualTerms
    };
  }
};

function extractDocumentTitle(text: string): string | null {
  // Look for common title patterns
  const titlePatterns = [
    /(?:terms?\s+(?:of\s+)?(?:service|use))/i,
    /(?:privacy\s+policy)/i,
    /(?:user\s+agreement)/i,
    /(?:end\s+user\s+license\s+agreement)/i,
    /(?:cookie\s+policy)/i,
    /(?:data\s+protection\s+policy)/i
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/^\w/, c => c.toUpperCase());
    }
  }

  return null;
}

function analyzeRiskItems(text: string): AnalysisResult['riskItems'] {
  const riskItems: AnalysisResult['riskItems'] = [];
  
  // Data collection analysis
  if (text.toLowerCase().includes('collect') && (text.toLowerCase().includes('data') || text.toLowerCase().includes('information'))) {
    riskItems.push({
      clause: "Data Collection and Usage",
      risk: "The document indicates collection of personal data which may include sensitive information",
      impact: text.toLowerCase().includes('share') || text.toLowerCase().includes('third') 
        ? "High privacy impact with potential data sharing" 
        : "Medium privacy impact from data collection",
      recommendation: "Review what specific data is collected and how it's used",
      severity: text.toLowerCase().includes('location') || text.toLowerCase().includes('biometric') ? 'high' : 'medium'
    });
  }

  // Third-party sharing analysis
  if (text.toLowerCase().includes('share') || text.toLowerCase().includes('third') || text.toLowerCase().includes('partner')) {
    riskItems.push({
      clause: "Third-Party Data Sharing",
      risk: "Data may be shared with third-party partners or service providers",
      impact: "Loss of control over personal information with external entities",
      recommendation: "Request transparency about third-party partners and sharing purposes",
      severity: 'high'
    });
  }

  // Marketing and advertising analysis
  if (text.toLowerCase().includes('marketing') || text.toLowerCase().includes('advertis') || text.toLowerCase().includes('promotional')) {
    riskItems.push({
      clause: "Marketing and Advertising",
      risk: "Personal data may be used for marketing purposes and targeted advertising",
      impact: "Increased exposure to unwanted communications and profiling",
      recommendation: "Look for opt-out options for marketing communications",
      severity: 'medium'
    });
  }

  // Cookies and tracking analysis
  if (text.toLowerCase().includes('cookie') || text.toLowerCase().includes('tracking') || text.toLowerCase().includes('analytics')) {
    riskItems.push({
      clause: "Cookies and Tracking",
      risk: "Website uses cookies and tracking technologies to monitor user behavior",
      impact: "Digital footprint creation and behavioral profiling across websites",
      recommendation: "Check cookie preferences and opt-out mechanisms",
      severity: 'medium'
    });
  }

  // Data retention analysis
  if (text.toLowerCase().includes('retain') || text.toLowerCase().includes('delete') || text.toLowerCase().includes('storage')) {
    riskItems.push({
      clause: "Data Retention and Deletion",
      risk: "Unclear or extended data retention periods may apply",
      impact: text.toLowerCase().includes('indefinitely') || text.toLowerCase().includes('permanent') 
        ? "High risk of permanent data storage" 
        : "Medium risk from data retention practices",
      recommendation: "Understand data deletion rights and retention periods",
      severity: text.toLowerCase().includes('indefinitely') ? 'high' : 'medium'
    });
  }

  // If no specific risks found, add general privacy risk
  if (riskItems.length === 0) {
    riskItems.push({
      clause: "General Privacy Terms",
      risk: "Standard privacy terms that may affect your personal data",
      impact: "Basic privacy implications from service usage",
      recommendation: "Review the complete terms to understand your privacy rights",
      severity: 'low'
    });
  }

  return riskItems;
}

function generateSummary(text: string, riskItems: AnalysisResult['riskItems']): AnalysisResult['summaryData'] {
  const summary: AnalysisResult['summaryData'] = [];

  // Create a concise 4-5 line summary based on the text content
  const summaryText = generateConciseSummary(text, riskItems);
  
  summary.push({
    title: "Document Analysis Summary",
    content: summaryText,
    riskLevel: riskItems.some(item => item.severity === 'high') ? 'high' : 
               riskItems.some(item => item.severity === 'medium') ? 'medium' : 'low'
  });

  return summary;
}

function generateConciseSummary(text: string, riskItems: AnalysisResult['riskItems']): string {
  const summaryPoints: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Analyze key aspects and create concise points
  if (lowerText.includes('collect') && (lowerText.includes('data') || lowerText.includes('information'))) {
    const hasSharing = lowerText.includes('share') || lowerText.includes('third');
    summaryPoints.push(`• Collects personal data${hasSharing ? ' and shares with third parties' : ' for service operations'}`);
  }
  
  if (lowerText.includes('cookie') || lowerText.includes('tracking')) {
    summaryPoints.push('• Uses cookies and tracking technologies for analytics');
  }
  
  if (lowerText.includes('marketing') || lowerText.includes('promotional')) {
    summaryPoints.push('• May use data for marketing and promotional communications');
  }
  
  if (lowerText.includes('right') || lowerText.includes('access') || lowerText.includes('delete')) {
    summaryPoints.push('• Provides user rights for data access and control');
  } else {
    summaryPoints.push('• Limited information about user data rights');
  }
  
  // Add overall risk assessment
  const highRiskItems = riskItems.filter(item => item.severity === 'high').length;
  if (highRiskItems > 0) {
    summaryPoints.push(`• ${highRiskItems} high-risk privacy concern${highRiskItems > 1 ? 's' : ''} identified`);
  }
  
  // Ensure we have 4-5 points
  if (summaryPoints.length < 4) {
    summaryPoints.push('• Review all terms carefully before accepting');
  }
  
  return summaryPoints.slice(0, 5).join('\n');
}

function extractIndividualTerms(text: string): AnalysisResult['individualTerms'] {
  const terms: AnalysisResult['individualTerms'] = [];
  
  // Essential service terms
  terms.push({
    id: 'essential-service',
    title: 'Essential Service Operations',
    description: 'Basic functionality and core service features',
    risk: 'low',
    isRequired: true
  });

  // Data collection terms
  if (text.toLowerCase().includes('collect')) {
    terms.push({
      id: 'data-collection',
      title: 'Personal Data Collection',
      description: 'Collection of your personal information for service provision',
      risk: text.toLowerCase().includes('sensitive') ? 'high' : 'medium',
      isRequired: false
    });
  }

  // Marketing terms
  if (text.toLowerCase().includes('marketing') || text.toLowerCase().includes('promotional')) {
    terms.push({
      id: 'marketing',
      title: 'Marketing Communications',
      description: 'Receiving promotional emails and marketing materials',
      risk: 'low',
      isRequired: false
    });
  }

  // Analytics terms
  if (text.toLowerCase().includes('analytics') || text.toLowerCase().includes('tracking')) {
    terms.push({
      id: 'analytics',
      title: 'Analytics and Tracking',
      description: 'Usage analytics and behavioral tracking for service improvement',
      risk: 'medium',
      isRequired: false
    });
  }

  // Third-party sharing
  if (text.toLowerCase().includes('share') || text.toLowerCase().includes('third')) {
    terms.push({
      id: 'third-party-sharing',
      title: 'Third-Party Data Sharing',
      description: 'Sharing your data with partner organizations and service providers',
      risk: 'high',
      isRequired: false
    });
  }

  // Location data
  if (text.toLowerCase().includes('location') || text.toLowerCase().includes('gps')) {
    terms.push({
      id: 'location-data',
      title: 'Location Data Collection',
      description: 'Accessing and storing your device location information',
      risk: 'high',
      isRequired: false
    });
  }

  // Cookies
  if (text.toLowerCase().includes('cookie')) {
    terms.push({
      id: 'cookies',
      title: 'Cookie Usage',
      description: 'Storing cookies on your device for functionality and tracking',
      risk: 'medium',
      isRequired: false
    });
  }

  return terms;
}

function calculateRiskScore(riskItems: AnalysisResult['riskItems'], text: string): number {
  let baseScore = 30; // Baseline risk score
  
  // Add points for each risk item based on severity
  riskItems.forEach(item => {
    switch (item.severity) {
      case 'high':
        baseScore += 20;
        break;
      case 'medium':
        baseScore += 10;
        break;
      case 'low':
        baseScore += 5;
        break;
    }
  });

  // Additional risk factors
  const riskKeywords = [
    { keyword: 'indefinitely', points: 15 },
    { keyword: 'permanent', points: 15 },
    { keyword: 'irrevocable', points: 10 },
    { keyword: 'biometric', points: 20 },
    { keyword: 'location', points: 10 },
    { keyword: 'children', points: 15 },
    { keyword: 'minor', points: 15 },
    { keyword: 'sell', points: 25 },
    { keyword: 'monetize', points: 20 }
  ];

  const lowerText = text.toLowerCase();
  riskKeywords.forEach(({ keyword, points }) => {
    if (lowerText.includes(keyword)) {
      baseScore += points;
    }
  });

  // Cap the score at 100
  return Math.min(baseScore, 100);
}