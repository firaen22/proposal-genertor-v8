
export type Language = 'zh-CN' | 'zh-HK';

export interface ScenarioValue {
  surrender: number;
  death: number;
}

export interface ScenarioBValue {
  cumulative: number;
  remaining: number;
}

export interface ClientData {
  name: string;
  age: number;
}

export interface PremiumData {
  total: number;
  paymentType: string; // e.g., "整付" or "5年"
}

export interface ScenarioAData {
  year10: ScenarioValue;
  year20: ScenarioValue;
  year30: ScenarioValue;
  year40: ScenarioValue;
}

export interface ScenarioBData {
  annualWithdrawal: number;
  withdrawalStartYear: number; // Field for auto-calculation start year
  year10: ScenarioBValue;
  year20: ScenarioBValue;
  year30: ScenarioBValue;
  year40: ScenarioBValue;
}

export interface GoalEvent {
  policyYearStart: number;
  policyYearEnd: number;
  amount: number; // Annual Amount
  cumulative?: number; // Auto-calculated running total
  purpose: string;
  remainingValue?: number; // Manual input for account value
  generation?: string; 
  genLabel?: string;
}

export interface ScenarioCData {
  goals: GoalEvent[];
}

export interface PromoOption {
  enabled: boolean;
  percent: number;
}

export interface PrepayOption {
  enabled: boolean;
  rate: number;
  deadline: string;
}

export interface PromoData {
  lumpSum: PromoOption;
  fiveYear: PromoOption;
  prepay: PrepayOption;
}

export interface PolicyLegacy {
  secondOwner: boolean;
  successorInsured: boolean;
}

export interface ProposalData {
  client: ClientData;
  planName: string;
  premium: PremiumData;
  legacy: PolicyLegacy;
  scenarioA: ScenarioAData;
  scenarioB: ScenarioBData;
  scenarioC: ScenarioCData;
  promo: PromoData;
}

export enum ViewMode {
  FORM = 'FORM',
  RESULT = 'RESULT'
}
