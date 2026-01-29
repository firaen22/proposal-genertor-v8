import { GoogleGenAI } from "@google/genai";
import { ProposalData } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

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