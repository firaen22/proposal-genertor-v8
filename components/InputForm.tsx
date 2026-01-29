import React from 'react';
import { ProposalData, ScenarioValue, ScenarioBValue, GoalEvent, Language } from '../types';
import { TRANSLATIONS, HK_DATA_MAP } from '../constants';

const GOAL_OPTIONS = [
  "大学教育基金 (University Education)",
  "外国升学基金 (Overseas Studies)",
  "结婚/创业金 (Marriage/Startup)",
  "退休基金 (Retirement Fund)",
  "传承予子女 (Gift to Descendants)",
  "家族遗产 (Compassionate Legacy)",
  "百年基业 (Centennial Legacy)"
];

const YEARS_KEYS = ['year10', 'year20', 'year30', 'year40'] as const;

// --- Sub-component: Goal Input Row ---
// Extracts the complexity of individual goal inputs out of the main form
interface GoalInputRowProps {
  goal: GoalEvent;
  index: number;
  data: ProposalData; // Needed for age calculation
  t: any;
  smartTranslate: (text: string) => string;
  onChange: (index: number, field: keyof GoalEvent, value: any) => void;
  onRemove: (index: number) => void;
}

const GoalInputRow: React.FC<GoalInputRowProps> = ({ goal, index, data, t, smartTranslate, onChange, onRemove }) => {
  const startAge = data.client.age + goal.policyYearStart;
  const endAge = data.client.age + goal.policyYearEnd;
  const ageDisplay = startAge === endAge ? `${startAge}` : `${startAge}-${endAge}`;

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-md border border-slate-200 relative animate-fade-in">
      <div className="flex gap-4 items-end">
        {/* Year Range Input */}
        <div className="w-40 flex-shrink-0">
          <label className="block text-xs text-slate-500 mb-1 font-bold">{t.policyYear} (Start - End)</label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="0"
              value={goal.policyYearStart}
              onChange={(e) => onChange(index, 'policyYearStart', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded border-slate-300 text-sm bg-white px-2 py-1 text-center"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              min="0"
              value={goal.policyYearEnd}
              onChange={(e) => onChange(index, 'policyYearEnd', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded border-slate-300 text-sm bg-white px-2 py-1 text-center"
            />
          </div>
        </div>

        {/* Derived Age Display */}
        <div className="w-24 flex-shrink-0">
          <label className="block text-xs text-slate-400 mb-1">{t.age} (Calc)</label>
          <div className="w-full rounded border border-transparent bg-slate-200 text-sm text-slate-600 px-2 py-1 text-center font-medium">
            {ageDisplay}
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1 font-bold">{t.annualAmt}</label>
          <input
            type="number"
            min="0"
            value={goal.amount}
            onChange={(e) => onChange(index, 'amount', Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full rounded border-slate-300 text-sm bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1 font-bold">{t.cumulativeWithdrawal} (Auto)</label>
          <input
            type="number"
            value={goal.cumulative || 0}
            readOnly
            className="w-full rounded border-slate-200 text-sm bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">{t.remainingValue}</label>
          <input
            type="number"
            min="0"
            value={goal.remainingValue || 0}
            onChange={(e) => onChange(index, 'remainingValue', Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full rounded border-slate-300 text-sm bg-white"
          />
        </div>
      </div>

      {/* Row 2: Generation Selector & Purpose */}
      <div className="flex gap-4 items-end w-full pr-8">
        <div className="w-48 flex-shrink-0">
          <label className="block text-xs text-slate-500 mb-1 font-bold">{t.generation}</label>
          <select
            value={goal.generation || "Gen 1"}
            onChange={(e) => onChange(index, 'generation', e.target.value)}
            className="w-full rounded border-slate-300 text-sm bg-white"
          >
            <option value="Gen 1">{t.gen1}: {t.gen1Short}</option>
            <option value="Gen 2">{t.gen2}: {t.gen2Short}</option>
            <option value="Gen 3">{t.gen3}: {t.gen3Desc}</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">{t.purpose}</label>
          <select
            value={goal.purpose}
            onChange={(e) => onChange(index, 'purpose', e.target.value)}
            className="w-full rounded border-slate-300 text-sm bg-white"
          >
            {GOAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {smartTranslate(opt)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => onRemove(index)}
        className="absolute bottom-3 right-3 text-red-500 hover:text-red-700 p-1"
        title="Remove Goal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};


// --- Main Component ---
interface InputFormProps {
  data: ProposalData;
  onChange: (data: ProposalData) => void;
  onSubmit: () => void;
  lang: Language;
}

export const InputForm: React.FC<InputFormProps> = ({ data, onChange, onSubmit, lang }) => {
  const t = TRANSLATIONS[lang];

  const smartTranslate = (text: string) => {
    if (lang === 'zh-HK' && HK_DATA_MAP[text]) return HK_DATA_MAP[text];
    return text;
  };

  // --- Handlers ---

  const handleChange = (section: keyof ProposalData, field: string, value: any, subField?: string) => {
    const newData = { ...data };
    if (subField) {
      (newData[section] as any)[field][subField] = value;
    } else {
      (newData[section] as any)[field] = value;
    }
    onChange(newData);
  };

  const handleScenarioAChange = (year: 'year10' | 'year20' | 'year30' | 'year40', type: keyof ScenarioValue, value: number) => {
    const newData = { ...data };
    newData.scenarioA[year][type] = value;
    onChange(newData);
  };

  const handleScenarioBInput = (field: 'annualWithdrawal' | 'withdrawalStartYear', value: number) => {
    const newData = { ...data };
    const annual = field === 'annualWithdrawal' ? value : newData.scenarioB.annualWithdrawal;
    const start = field === 'withdrawalStartYear' ? value : newData.scenarioB.withdrawalStartYear;

    // Recalculate logic for Scenario B
    const calc = (targetPolicyYear: number) => {
      if (targetPolicyYear < start) return 0;
      return annual * (targetPolicyYear - start + 1);
    };

    newData.scenarioB.annualWithdrawal = annual;
    newData.scenarioB.withdrawalStartYear = start;
    newData.scenarioB.year10.cumulative = calc(10);
    newData.scenarioB.year20.cumulative = calc(20);
    newData.scenarioB.year30.cumulative = calc(30);
    newData.scenarioB.year40.cumulative = calc(40);

    onChange(newData);
  };

  const handleScenarioBValueChange = (year: 'year10' | 'year20' | 'year30' | 'year40', type: keyof ScenarioBValue, value: number) => {
    const newData = { ...data };
    newData.scenarioB[year][type] = value;
    onChange(newData);
  };

  // Goal Logic
  const recalculateScenarioCCumulative = (goals: GoalEvent[]) => {
    // Robustness: Sort goals by start year to ensure cumulative calculation is chronological
    const sortedGoals = [...goals].sort((a, b) => a.policyYearStart - b.policyYearStart);
    
    let runningTotal = 0;
    return sortedGoals.map(goal => {
      const duration = Math.max(1, goal.policyYearEnd - goal.policyYearStart + 1);
      runningTotal += (goal.amount * duration);
      return { ...goal, cumulative: runningTotal };
    });
  };

  const handleGoalChange = (index: number, field: keyof GoalEvent, value: any) => {
    const newGoals = [...data.scenarioC.goals];
    newGoals[index] = { ...newGoals[index], [field]: value };

    // Auto-fix start/end range
    if (field === 'policyYearStart' && newGoals[index].policyYearEnd < value) newGoals[index].policyYearEnd = value;
    if (field === 'policyYearEnd' && newGoals[index].policyYearStart > value) newGoals[index].policyYearStart = value;

    const newData = { ...data };
    // Only recalculate cumulative if amounts or years change
    newData.scenarioC.goals = ['amount', 'policyYearStart', 'policyYearEnd'].includes(field as string)
      ? recalculateScenarioCCumulative(newGoals)
      : newGoals;
    
    onChange(newData);
  };

  const addGoal = () => {
    const lastGoal = data.scenarioC.goals[data.scenarioC.goals.length - 1];
    const newStart = lastGoal ? lastGoal.policyYearEnd + 5 : 10;
    const newGoal: GoalEvent = {
      policyYearStart: newStart,
      policyYearEnd: newStart,
      amount: 0,
      cumulative: 0,
      remainingValue: 0,
      purpose: GOAL_OPTIONS[0],
      generation: "Gen 1"
    };

    const newData = { ...data };
    newData.scenarioC.goals.push(newGoal);
    newData.scenarioC.goals = recalculateScenarioCCumulative(newData.scenarioC.goals);
    onChange(newData);
  };

  const removeGoal = (index: number) => {
    const newData = { ...data };
    newData.scenarioC.goals.splice(index, 1);
    newData.scenarioC.goals = recalculateScenarioCCumulative(newData.scenarioC.goals);
    onChange(newData);
  };

  // --- Render ---

  return (
    <div className="bg-white shadow-xl rounded-lg p-8 border-t-4 border-amber-600">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 serif-font">Proposal Parameters</h2>
        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded">PRIVATE WEALTH PROPOSAL</span>
      </div>

      <div className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <section>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 serif-font">Client & Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t.clientName}</label>
              <input type="text" value={data.client.name} onChange={(e) => handleChange('client', 'name', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t.entryAge}</label>
              <input type="number" min="0" value={data.client.age} onChange={(e) => handleChange('client', 'age', Math.max(0, parseInt(e.target.value) || 0))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t.planName}</label>
              <input type="text" value={smartTranslate(data.planName)} onChange={(e) => handleChange('planName', '', e.target.value)} onInput={(e) => onChange({ ...data, planName: e.currentTarget.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t.totalPremium} ($)</label>
              <input type="number" min="0" value={data.premium.total} onChange={(e) => handleChange('premium', 'total', Math.max(0, parseInt(e.target.value) || 0))} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t.paymentType}</label>
              <select value={data.premium.paymentType} onChange={(e) => handleChange('premium', 'paymentType', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white">
                <option value={t.rebateLumpSum}>{t.rebateLumpSum} (Lump Sum)</option>
                <option value={t.rebate5Year}>{t.rebate5Year} (5 Years)</option>
                <option value="10年">10年 (10 Years)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
             <label className="block text-sm font-bold text-amber-600 mb-2 uppercase tracking-wider serif-font">{t.policyLegacyFeatures}</label>
             <div className="flex gap-6">
               <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={data.legacy.secondOwner} 
                   onChange={(e) => handleChange('legacy', 'secondOwner', e.target.checked)}
                   className="rounded text-amber-600 focus:ring-amber-500"
                 />
                 <span>{t.secondOwner}</span>
               </label>
               <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={data.legacy.successorInsured} 
                   onChange={(e) => handleChange('legacy', 'successorInsured', e.target.checked)}
                   className="rounded text-amber-600 focus:ring-amber-500"
                 />
                 <span>{t.successorInsured}</span>
               </label>
             </div>
          </div>
        </section>

        {/* Section 2: Scenario A (Refactored to use map) */}
        <section>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 serif-font">{t.scenarioA}</h3>
          <div className="grid grid-cols-1 gap-4">
            {YEARS_KEYS.map((year) => (
              <div key={year} className="flex flex-col md:flex-row md:items-center gap-4 p-3 bg-slate-50 rounded-md">
                <span className="w-20 text-sm font-bold text-slate-500 uppercase">{year.replace('year', 'Yr ')}</span>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500">{t.surrenderValue}</label>
                  <input
                    type="number"
                    min="0"
                    value={data.scenarioA[year].surrender}
                    onChange={(e) => handleScenarioAChange(year, 'surrender', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded border-slate-200 text-sm bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500">{t.deathBenefit}</label>
                  <input
                    type="number"
                    min="0"
                    value={data.scenarioA[year].death}
                    onChange={(e) => handleScenarioAChange(year, 'death', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded border-slate-200 text-sm bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Scenario B (Refactored to use map) */}
        <section>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 serif-font">{t.scenarioB}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4 bg-amber-50 p-4 rounded-md border border-amber-200">
            <div>
              <label className="block text-sm font-bold text-amber-800">{t.annualWithdrawal} ($)</label>
              <input type="number" min="0" value={data.scenarioB.annualWithdrawal} onChange={(e) => handleScenarioBInput('annualWithdrawal', Math.max(0, parseInt(e.target.value) || 0))} className="mt-1 block w-full rounded-md border border-amber-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-800">Start Year (Policy Year)</label>
              <input type="number" min="0" value={data.scenarioB.withdrawalStartYear || 6} onChange={(e) => handleScenarioBInput('withdrawalStartYear', Math.max(0, parseInt(e.target.value) || 0))} className="mt-1 block w-full rounded-md border border-amber-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {YEARS_KEYS.map((year) => (
              <div key={year} className="flex flex-col md:flex-row md:items-center gap-4 p-3 bg-slate-50 rounded-md">
                <span className="w-20 text-sm font-bold text-slate-500 uppercase">{year.replace('year', 'Yr ')}</span>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 font-bold">{t.cumulativeWithdrawal} (Auto)</label>
                  <input type="number" value={data.scenarioB[year].cumulative} readOnly className="w-full rounded border-slate-200 text-sm bg-slate-100 text-slate-500 cursor-not-allowed font-medium" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500">{t.remainingValue}</label>
                  <input type="number" min="0" value={data.scenarioB[year].remaining} onChange={(e) => handleScenarioBValueChange(year, 'remaining', Math.max(0, parseInt(e.target.value) || 0))} className="w-full rounded border-slate-200 text-sm bg-white" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Scenario C (Using Extracted Component) */}
        <section>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 serif-font">{t.scenarioC}</h3>
          <div className="space-y-4">
            {data.scenarioC.goals.map((goal, index) => (
              <GoalInputRow
                key={index}
                index={index}
                goal={goal}
                data={data}
                t={t}
                smartTranslate={smartTranslate}
                onChange={handleGoalChange}
                onRemove={removeGoal}
              />
            ))}
            <button
              onClick={addGoal}
              className="mt-2 text-sm text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded font-medium flex items-center shadow-sm"
            >
              + Add Life Goal
            </button>
          </div>
        </section>

        {/* Section 5: Promo */}
        <section>
          <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 serif-font">{t.promotions}</h3>
          <div className="space-y-4">
            {/* Lump Sum */}
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={data.promo.lumpSum.enabled} onChange={(e) => handleChange('promo', 'lumpSum', e.target.checked, 'enabled')} className="h-4 w-4 text-amber-600 mr-2" />
                  Rebate: {t.rebateLumpSum} (Lump Sum)
                </label>
                {data.promo.lumpSum.enabled && (
                  <div className="flex items-center w-32">
                    <input type="number" min="0" value={data.promo.lumpSum.percent} onChange={(e) => handleChange('promo', 'lumpSum', parseFloat(e.target.value), 'percent')} className="w-full rounded-l-md border-slate-300 text-sm text-right bg-white" />
                    <span className="bg-slate-200 px-2 py-2 rounded-r-md border border-l-0 border-slate-300 text-xs text-slate-600">%</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5 Year */}
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={data.promo.fiveYear.enabled} onChange={(e) => handleChange('promo', 'fiveYear', e.target.checked, 'enabled')} className="h-4 w-4 text-amber-600 mr-2" />
                  Rebate: {t.rebateLumpSum} (5-Year Payment)
                </label>
                {data.promo.fiveYear.enabled && (
                  <div className="flex items-center w-32">
                    <input type="number" min="0" value={data.promo.fiveYear.percent} onChange={(e) => handleChange('promo', 'fiveYear', parseFloat(e.target.value), 'percent')} className="w-full rounded-l-md border-slate-300 text-sm text-right bg-white" />
                    <span className="bg-slate-200 px-2 py-2 rounded-r-md border border-l-0 border-slate-300 text-xs text-slate-600">%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prepayment */}
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={data.promo.prepay.enabled} onChange={(e) => handleChange('promo', 'prepay', e.target.checked, 'enabled')} className="h-4 w-4 text-amber-600 mr-2" />
                  Prepayment Interest ({t.prepayInterest})
                </label>
              </div>
              {data.promo.prepay.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Interest Rate</label>
                    <div className="flex items-center">
                      <input type="number" min="0" value={data.promo.prepay.rate} onChange={(e) => handleChange('promo', 'prepay', parseFloat(e.target.value), 'rate')} className="w-full rounded-l-md border-slate-300 text-sm text-right bg-white" step="0.1" />
                      <span className="bg-slate-200 px-2 py-2 rounded-r-md border border-l-0 border-slate-300 text-xs text-slate-600">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Offer Deadline</label>
                    <input type="date" value={data.promo.prepay.deadline} onChange={(e) => handleChange('promo', 'prepay', e.target.value, 'deadline')} className="w-full rounded-md border-slate-300 text-sm bg-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="pt-6">
          <button onClick={onSubmit} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all">
            Generate Proposal (PDF Report)
          </button>
        </div>
      </div>
    </div>
  );
};
