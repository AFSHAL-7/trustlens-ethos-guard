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

    const systemPrompt = `You are an expert legal analyst specializing in privacy policies, terms of service, and user agreements. Your task is to:

1. Identify the company/service from the terms and conditions
2. Deeply analyze every clause for privacy risks, data usage, and user rights
3. Provide actionable safety recommendations
4. Compare against known safe practices from popular services (WhatsApp, ChatGPT, Google, etc.)
5. Rate the overall risk and explain your reasoning

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
            content: `Analyze these terms and conditions thoroughly:\n\n${text}` 
          },
        ],
        temperature: 0.3,
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
