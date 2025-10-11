import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, imageData, pdfData, docData, fileName, type } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting AI analysis of terms and conditions...");
    
    let documentText = text;
    
    // Handle image data - use vision model to extract text (multi-language support)
    if (type === 'image' && imageData) {
      console.log("Processing image document with multi-language OCR...");
      const ocrResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract ALL text from this image in its ORIGINAL LANGUAGE (English, Tamil, Hindi, Russian, Japanese, Chinese, Arabic, or any other language). This is a legal document (Terms and Conditions, Privacy Policy, etc.). Extract every single word, sentence, clause, and section line by line. Maintain the exact original structure, formatting, headings, and order. Include ALL content visible - titles, sections, numbered clauses, bullet points, fine print, everything. Do NOT translate - keep the original language. Be thorough and comprehensive, analyze page by page if multiple pages.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          temperature: 0.05,
          max_tokens: 12000
        })
      });

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        console.error('OCR error:', errorText);
        throw new Error('Failed to extract text from image. Please ensure the image is clear and readable.');
      }

      const ocrData = await ocrResponse.json();
      documentText = ocrData.choices[0]?.message?.content || '';
      
      if (!documentText || documentText.length < 50) {
        throw new Error('Could not extract readable text from the image. Please ensure the image is clear, well-lit, and contains Terms & Conditions or Privacy Policy text in any language.');
      }
      
      console.log(`Extracted ${documentText.length} characters from image`);
    }
    
    // Handle PDF/DOC data - for now, inform user
    if ((type === 'pdf' || type === 'document') && (pdfData || docData)) {
      console.log(`PDF/DOCX support: ${type} document ${fileName}`);
      throw new Error(`PDF and Word document analysis is coming soon. For now, please either:\n1. Copy and paste the text from the document, or\n2. Take a screenshot/photo of each page and upload as images`);
    }
    
    // Step 1: Create document hash for consistency and detect language
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(documentText.trim().toLowerCase().substring(0, 5000));
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const documentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
    console.log("Document hash for consistency:", documentHash);

    // Step 2: Validate if this is a legal document and detect language
    const validationPrompt = `You are a multilingual document classifier with NLP expertise. Analyze the following text in ANY language (English, Tamil, Hindi, Russian, Japanese, Chinese, Arabic, Spanish, etc.) and determine:
1. Is it a Terms and Conditions, Privacy Policy, Terms of Service, User Agreement, EULA, or similar legal document?
2. What language is it written in?

Respond with ONLY a JSON object in this exact format:
{
  "isLegalDocument": boolean,
  "documentType": "terms_of_service" | "privacy_policy" | "user_agreement" | "eula" | "other" | "not_legal",
  "confidence": number (0-100),
  "detectedLanguage": "language name (e.g., English, Tamil, Hindi, Russian, Japanese)",
  "reason": "string explaining why"
}

Text to classify:
${documentText.substring(0, 3000)}`;

    const validationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "user", content: validationPrompt }
        ],
        temperature: 0.05,
        max_tokens: 500,
      }),
    });

    let detectedLanguage = 'English';
    let documentType = 'terms_of_service';

    if (validationResponse.ok) {
      const validationData = await validationResponse.json();
      const validationContent = validationData.choices?.[0]?.message?.content;
      
      if (validationContent) {
        try {
          const cleanValidation = validationContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const validation = JSON.parse(cleanValidation);
          detectedLanguage = validation.detectedLanguage || 'English';
          documentType = validation.documentType || 'terms_of_service';
          
          console.log("Document validated:", validation.documentType, "Language:", detectedLanguage, "Confidence:", validation.confidence);
          
          if (!validation.isLegalDocument || validation.documentType === "not_legal" || validation.confidence < 60) {
            console.log("Document validation failed:", validation);
            return new Response(
              JSON.stringify({ 
                error: "This document does not appear to contain Terms & Conditions or a Privacy Policy. Please provide a valid legal document for analysis.",
                validationInfo: validation,
                detectedLanguage: detectedLanguage
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
        } catch (e) {
          console.warn("Could not parse validation response, proceeding with analysis");
        }
      }
    }

    const systemPrompt = `You are an expert MULTILINGUAL legal and privacy analyst with advanced NLP capabilities. You can analyze legal documents in ANY language including English, Tamil, Hindi, Russian, Japanese, Chinese, Arabic, Spanish, French, German, Korean, and more. Your analysis must be CONSISTENT, ACCURATE, and DETERMINISTIC:

MULTILINGUAL: Analyze documents in their ORIGINAL language - do NOT translate
NLP-POWERED: Use advanced natural language processing to understand context, implications, and hidden risks
COMPREHENSIVE: Examine every clause line by line, not just surface-level terms
ACCURATE: Identify the exact company name and service being analyzed
COMPARATIVE: Compare practices to well-known services (WhatsApp, Signal, ChatGPT, Google, Facebook, etc.)
ACTIONABLE: Provide specific, practical safety recommendations in the SAME language
DETERMINISTIC: Same document must always produce the same risk score (use document hash: ${documentHash})
CONSISTENT: Use objective scoring criteria, not subjective interpretation
LEARNING: Previous analyses inform consistency - same T&C = same results

CRITICAL CONSISTENCY RULE:
If you analyze the EXACT SAME document text again, you MUST return the EXACT SAME risk score. Base your score on objective, measurable criteria only.

DETERMINISTIC RISK SCORING FORMULA (0-100):

Base Score Calculation (add points for each factor):

DATA COLLECTION (+0-25 points):
- Basic info only (name, email): +5
- Behavioral data (browsing, clicks): +10
- Location tracking: +8
- Biometric data: +15
- Sells data to third parties: +15
- Shares with affiliates: +10
- No clear data retention limit: +7

USER RIGHTS (-10 to +20 points):
- Easy data deletion: -5
- Data portability: -5
- Clear opt-out mechanisms: -5
- No deletion rights: +10
- Difficult to exercise rights: +8
- Must email/write to request data: +5

LEGAL PROTECTIONS (+0-20 points):
- Forced arbitration: +12
- Class action waiver: +8
- Broad liability limitations: +10
- Can change terms without notice: +8
- No breach notification commitment: +10

TRANSPARENCY (+0-15 points):
- Vague data use language: +10
- "Partners" undefined: +8
- No clear privacy contact: +5
- Changes buried in document: +7

COMPLIANCE & SECURITY (-10 to +15 points):
- GDPR compliant: -5
- CCPA compliant: -3
- Mentions encryption: -5
- ISO/SOC2 certified: -5
- No security measures mentioned: +10
- No compliance mentioned: +8

FINAL RISK CATEGORIES:
- 0-30: Low risk
- 31-60: Medium risk  
- 61-100: High risk

ANALYSIS REQUIREMENTS:

1. COMPANY IDENTIFICATION:
   - Extract the exact company/service name from legal notices, headers, or copyright statements
   - Identify the jurisdiction and legal entity
   - Parse copyright notices and legal entity names

2. OBJECTIVE CLAUSE ANALYSIS:
   - Count and categorize data types collected
   - Identify all third-party sharing explicitly mentioned
   - List user rights with exact quote references
   - Document security measures mentioned
   - Note compliance frameworks cited (GDPR, CCPA, etc.)
   - Flag concerning clauses with severity based on legal precedent

3. COMPARATIVE BENCHMARKING:
   - Compare to specific known services (e.g., "Collects location data like Google Maps")
   - Quantify differences when possible (e.g., "Retains data 2x longer than industry average")
   - Reference specific practices of WhatsApp, Signal, Apple, etc.

4. DOCUMENT FINGERPRINTING:
   Document Hash: ${documentHash}
   Use this hash to ensure identical documents get identical scores
   
5. MULTILINGUAL NLP ANALYSIS:
   - Analyze in the original language (${detectedLanguage})
   - Use semantic understanding for context and implications
   - Identify culturally-specific legal patterns
   - Apply jurisdiction-appropriate legal standards
   - Return all findings in the ORIGINAL language

You must return a JSON object with this EXACT structure (no markdown, no extra text):
{
  "documentTitle": "string - the identified document title",
  "companyName": "string - the company or service name identified",
  "riskScore": number between 0-100,
  "riskItems": [
    {
      "clause": "string - specific clause title",
      "risk": "string - detailed risk explanation",
      "impact": "string - real-world impact on users",
      "recommendation": "string - specific action user should take",
      "severity": "low" | "medium" | "high"
    }
  ],
  "summaryData": [
    {
      "title": "string - summary section title",
      "content": "string - 4-5 bullet points with key findings",
      "riskLevel": "low" | "medium" | "high"
    }
  ],
  "individualTerms": [
    {
      "id": "string - unique identifier",
      "title": "string - term title",
      "description": "string - what this term means",
      "risk": "low" | "medium" | "high",
      "isRequired": boolean
    }
  ],
  "safetyInsights": {
    "comparisonToSafeServices": "string - how this compares to known safe services",
    "recommendedUsage": "string - how users should safely use this service",
    "trustScore": number between 0-100,
    "keyWarnings": ["string array of critical warnings"]
  }
}

Be thorough, specific, and base recommendations on actual legal and privacy best practices.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this ${documentType} document in ${detectedLanguage} using advanced NLP and the DETERMINISTIC SCORING FORMULA. 

CRITICAL INSTRUCTIONS:
- Analyze line by line thoroughly - read EVERY clause
- Calculate the risk score objectively using the formula
- Document Hash: ${documentHash} - Use this for consistency
- Return analysis in ${detectedLanguage} (the original language)
- If you analyze this EXACT document again, return the EXACT SAME score
- Use NLP to understand context, implications, and hidden risks

Document to analyze:
${documentText}

Remember: Thorough line-by-line analysis. Same document hash = same score. Analysis in ${detectedLanguage}.`
          },
        ],
        temperature: 0.05,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI analysis completed successfully");

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI analysis result");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-consent function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
