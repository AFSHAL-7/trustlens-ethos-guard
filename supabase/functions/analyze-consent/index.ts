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
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting AI analysis of terms and conditions...");
    
    // First, validate if this is actually a T&C or privacy policy document
    const validationPrompt = `You are a document classifier. Analyze the following text and determine if it is a Terms and Conditions, Privacy Policy, Terms of Service, User Agreement, End User License Agreement (EULA), or similar legal document.

Respond with ONLY a JSON object in this exact format:
{
  "isLegalDocument": boolean,
  "documentType": "terms_of_service" | "privacy_policy" | "user_agreement" | "eula" | "other" | "not_legal",
  "confidence": number (0-100),
  "reason": "string explaining why"
}

Text to classify:
${text.substring(0, 2000)}`;

    const validationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: validationPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (validationResponse.ok) {
      const validationData = await validationResponse.json();
      const validationContent = validationData.choices?.[0]?.message?.content;
      
      if (validationContent) {
        try {
          const cleanValidation = validationContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const validation = JSON.parse(cleanValidation);
          
          if (!validation.isLegalDocument || validation.documentType === "not_legal" || validation.confidence < 60) {
            console.log("Document validation failed:", validation);
            return new Response(
              JSON.stringify({ 
                error: "This document does not appear to contain Terms & Conditions or a Privacy Policy. Please provide a valid legal document for analysis.",
                validationInfo: validation
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
          console.log("Document validated as legal document:", validation.documentType);
        } catch (e) {
          console.warn("Could not parse validation response, proceeding with analysis");
        }
      }
    }

    const systemPrompt = `You are an expert legal and privacy analyst with deep expertise in analyzing terms of service, privacy policies, and user agreements. Your analysis must be CONSISTENT, ACCURATE, and DETERMINISTIC:

COMPREHENSIVE: Examine every clause, not just surface-level terms
ACCURATE: Identify the exact company name and service being analyzed
COMPARATIVE: Compare practices to well-known services (WhatsApp, Signal, ChatGPT, Google, Facebook, etc.)
ACTIONABLE: Provide specific, practical safety recommendations
DETERMINISTIC: Same document must always produce the same risk score
CONSISTENT: Use objective scoring criteria, not subjective interpretation

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
   Create a consistent hash of the document's key terms to ensure the same document always gets the same score

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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this legal document using the DETERMINISTIC SCORING FORMULA provided. Calculate the risk score by objectively counting and measuring each factor. If you see this exact text again, you must return the exact same score.

Document to analyze:
${text}

Remember: Use the objective scoring criteria. Same document = same score.` 
          },
        ],
        temperature: 0.1,
        max_tokens: 5000,
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
