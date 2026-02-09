import { GoogleGenAI } from "@google/genai";
import { ProposalData } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// Helper to convert File to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to validate API Key
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.list();
    return true;
  } catch (error) {
    return false;
  }
};

// Helper to get available models
export const getAvailableModels = async (apiKey?: string): Promise<string[]> => {
  const finalApiKey = apiKey || process.env.API_KEY || '';
  if (!finalApiKey) return [];

  try {
    const ai = new GoogleGenAI({ apiKey: finalApiKey });
    const response = await ai.models.list();

    // Filter for gemini models that likely support generation
    // structure might deal with pages, but simple iteration if Pager supports it
    // The type def says Promise<Pager<types.Model>>. 
    // Usually pagers are async iterables or have a page property.
    // Based on other SDKs, we might need to iterate. 
    // For simplicity, let's assume we can get a list or iterate.

    const models: string[] = [];
    // @ts-ignore - Pager handling might differ, treating as async iterable for safety
    for await (const model of response) {
      if (model.name && (model.name.includes('gemini') || model.name.includes('flash') || model.name.includes('pro'))) {
        // Model names usually come as 'models/gemini-pro', we want just the ID if possible or full name
        // The generateContent accepts 'gemini-2.0-flash' or 'models/gemini-2.0-flash'
        models.push(model.name.replace('models/', ''));
      }
    }
    return models;
  } catch (error) {
    console.warn("Failed to list models:", error);
    return ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"]; // Fallback defaults
  }
};

export const parsePDFProposal = async (file: File, apiKey?: string, modelId: string = "gemini-2.0-flash-exp"): Promise<Partial<ProposalData>> => {
  const finalApiKey = apiKey || process.env.API_KEY || ''; // Use provided key, then env, then empty
  if (!finalApiKey) {
    throw new Error("API Key is missing. Please provide one.");
  }

  const ai = new GoogleGenAI({ apiKey: finalApiKey });

  const prompt = `
    Analyze this insurance proposal PDF and extract the following data into a JSON format that matches this structure:
    {
      "client": { "name": "string", "age": number },
      "planName": "string",
      "premium": { "total": number, "paymentType": "string" },
      "scenarioA": {
        "year10": { "surrender": number, "death": number },
        "year20": { "surrender": number, "death": number },
        "year30": { "surrender": number, "death": number },
        "year40": { "surrender": number, "death": number }
      },
      "scenarioB": {
        "annualWithdrawal": number, // For REGULAR, RECURRING income (e.g. Pension)
        "withdrawalStartYear": number,
        "year10": { "remaining": number },
        "year20": { "remaining": number },
        "year30": { "remaining": number },
        "year40": { "remaining": number }
      },
      "scenarioC": {
        "goals": [
          // For SPECIFIC, ONE-TIME or SHORT-TERM needs (e.g. 4-year University, Wedding, Legacy Lumpsum)
          {
            "policyYearStart": number,
            "policyYearEnd": number,
            "amount": number,
            "remainingValue": number,
            "purpose": "string",
            "generation": "string"
          }
        ]
      }
    }

    For Scenario C (Goals):
    - DETECT ANY table or list labeled "Financial Needs", "Dream Account", "Life Events", "Future Goals", "Education Fund", "Retirement", "Withdrawal Scheme", or similar.
    - ALSO LOOK FOR "Wealth Transfer", "Legacy", "Succession", "Passing On" sections.
    - LOOK FOR rows with "Age" or "End of Year", an "Amount" (Withdrawal), and optionally "Cash Value" / "Surrender Value" (Remaining).
    
    - **CRITICAL**: If you see consecutive years with the SAME withdrawal amount, GROUP THEM.
      Example: Age 65 ($50k), Age 66 ($50k) ... Age 85 ($50k) -> Create ONE goal: { policyYearStart: (65-EntryAge), policyYearEnd: (85-EntryAge), amount: 50000 }.
    
    - **CRITICAL**: Extract "Remaining Value". Look for columns like "Surrender Value", "Cash Value", "Total Cash Value" in the same row.
      Example: "Age 60: Withdraw $20,000, CVS $500,000" -> { ..., amount: 20000, remainingValue: 500000 }.

    - SPECIFIC RANGE: Look for "Retirement Income" or "Withdrawal" often spanning Age 60/65 to 85/100.
    - EXAMPLE: "Age 18: $100,000 for University" -> policyYearStart: (18 - EntryAge), amount: 100000.
    - EXAMPLE: "Age 85: Pass on to Next Gen" -> policyYearStart: (85 - EntryAge), amount: SurrenderValue at that year.
    - EXTRACT AS MANY GOALS AS POSSIBLE.

    For Premium: 
    - Priority 1: Look for "Total Premiums Paid" or "Total Premium".
    - Priority 2: formatting like "$50,000 x 5 years" -> Total is 250,000.
    - Ensure the value is the *Total* cumulative premium, not annual.

    For Payment Type: 
    - Look for "Premium Payment Term", "Payment Mode", "Premium Term".
    - "Single", "One-time", "1 Year", "Lump Sum" -> "一笔过"
    - "5 Years", "5 Pay", "5-Pay" -> "5年"
    - "10 Years", "10 Pay", "10-Pay" -> "10年"
    
    If a value is not found, use 0 or empty string.
    Return ONLY valid JSON.
  `;

  try {
    const imagePart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          parts: [
            { text: prompt },
            imagePart
          ]
        }
      ]
    });

    const text = response.text;
    if (!text) throw new Error("No text content generated from PDF.");

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/^```json\n|\n```$/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw error;
  }
};

export const generateProposal = async (data: ProposalData): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare derived strings for promo data to match expected prompt format
  const rebateParts = [];
  if (data.promo.lumpSum.enabled) rebateParts.push(`一笔过 ${data.promo.lumpSum.percent}%`);
  if (data.promo.fiveYear.enabled) rebateParts.push(`5年缴 ${data.promo.fiveYear.percent}%`);
  const rebateString = rebateParts.length > 0 ? rebateParts.join(", ") : "N/A";

  const prepayString = data.promo.prepay.enabled
    ? `${data.promo.prepay.rate}% (截止: ${data.promo.prepay.deadline})`
    : "N/A";

  // Formatting the user input according to the schema requested
  const userPrompt = `
客户资讯: { 姓名: "${data.client.name}", 年龄: ${data.client.age} }
计划名称: "${data.planName}"
保费数据: { 总额: ${data.premium.total}, 缴费方式: "${data.premium.paymentType}" }
情境A数据:
  第10年: { 退保: ${data.scenarioA.year10.surrender}, 身故: ${data.scenarioA.year10.death} }
  第20年: { 退保: ${data.scenarioA.year20.surrender}, 身故: ${data.scenarioA.year20.death} }
  第30年: { 退保: ${data.scenarioA.year30.surrender}, 身故: ${data.scenarioA.year30.death} }
  第40年: { 退保: ${data.scenarioA.year40.surrender}, 身故: ${data.scenarioA.year40.death} }
情境B数据:
  每年提取: ${data.scenarioB.annualWithdrawal}
  第10年: { 累计提取: ${data.scenarioB.year10.cumulative}, 剩余价值: ${data.scenarioB.year10.remaining} }
  第20年: { 累计提取: ${data.scenarioB.year20.cumulative}, 剩余价值: ${data.scenarioB.year20.remaining} }
  第30年: { 累计提取: ${data.scenarioB.year30.cumulative}, 剩余价值: ${data.scenarioB.year30.remaining} }
  第40年: { 累计提取: ${data.scenarioB.year40.cumulative}, 剩余价值: ${data.scenarioB.year40.remaining} }
推广优惠: 
  回赠: "${rebateString}"
  预缴利率: "${prepayString}"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using the pro model for complex coding/latex tasks
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for consistent code generation
      },
    });

    return response.text || "Error: No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};