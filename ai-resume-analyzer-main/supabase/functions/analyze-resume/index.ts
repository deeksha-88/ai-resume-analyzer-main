import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert career analyst AI. You will receive a resume and a job description. Analyze them and return a JSON object with exactly these fields:

{
  "score": <number 0-100, the match percentage>,
  "summary": "<2-3 sentence AI insight about the candidate's fit for the role, mentioning specific strengths and gaps>",
  "matchedSkills": {
    "labels": ["skill1", "skill2", ...],
    "values": [90, 85, ...]  // proficiency percentages 0-100
  },
  "missingSkills": {
    "labels": ["skill1", "skill2", ...],
    "values": [80, 70, ...]  // gap intensity percentages 0-100 (higher = bigger gap)
  },
  "roadmap": [
    {
      "skill": "SkillName",
      "why": "One sentence explanation of why this skill matters for the role",
      "links": [
        { "name": "Resource Name – Platform", "url": "https://..." },
        { "name": "Resource Name – Platform", "url": "https://..." }
      ]
    }
  ],
  "modifiedResume": "<The full improved resume text with missing skills integrated, better formatting, and enhanced descriptions. Keep all original information but improve it.>"
}

Rules:
- matchedSkills should have 5-8 skills that the candidate has which match the job
- missingSkills should have 4-7 skills the candidate is missing
- roadmap should cover each missing skill with 2-3 real learning links from platforms like W3Schools, freeCodeCamp, YouTube, Coursera, GeeksforGeeks, MDN, Udemy
- Use REAL URLs from these platforms (e.g., https://www.w3schools.com/python/, https://www.freecodecamp.org/learn/, https://www.youtube.com/results?search_query=learn+docker)
- modifiedResume should be a complete improved version of the resume
- Return ONLY valid JSON, no markdown, no code blocks`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Resume text and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.ai-resume-analyzer.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `RESUME:\n${resumeText.substring(0, 8000)}\n\nJOB DESCRIPTION:\n${jobDescription.substring(0, 4000)}`
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your ai-resume-analyzer AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Remove any markdown code block wrappers
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI analysis results");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
