import React, { useState, useRef } from 'react';
import { ProposalData, Language } from '../types';
import { TRANSLATIONS, HK_DATA_MAP } from '../constants';

// --- Constants & Helper Types ---
const YEAR_KEYS = ['year10', 'year20', 'year30', 'year40'] as const;
const YEAR_VALS = [10, 20, 30, 40];

// --- Visual Components ---

const Infographic = ({ t }: { t: any }) => (
  <div className="flex justify-center my-4 w-full">
    <svg className="w-full h-auto max-h-[250px]" viewBox="-130 -130 260 220" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#B8860B" />
        </marker>
      </defs>
      {/* Lines extended for larger radius and spacing */}
      <line x1="0" y1="0" x2="0" y2="-90" stroke="#B8860B" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="0" y1="0" x2="-78" y2="55" stroke="#B8860B" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="0" y1="0" x2="78" y2="55" stroke="#B8860B" strokeWidth="2" markerEnd="url(#arrow)" />

      {/* Center Circle: Radius 40 */}
      <circle cx="0" cy="0" r="40" fill="#FFF8DC" stroke="#B8860B" strokeWidth="2" />
      <text x="0" y="-6" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" fontFamily="Noto Serif, serif">{t.wealthLegacy.substring(0, 2)}</text>
      <text x="0" y="12" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333" fontFamily="Noto Serif, serif">{t.wealthLegacy.substring(2)}</text>

      {/* Top Circle: Radius 35 */}
      <circle cx="0" cy="-90" r="35" fill="#212C3C" />
      <text x="0" y="-95" textAnchor="middle" fontSize="11" fill="white" fontFamily="Noto Sans TC, sans-serif">{t.wealthGrowth.substring(0, 2)}</text>
      <text x="0" y="-81" textAnchor="middle" fontSize="11" fill="white" fontFamily="Noto Sans TC, sans-serif">{t.wealthGrowth.substring(2)}</text>

      {/* Left Circle: Radius 35 */}
      <circle cx="-78" cy="55" r="35" fill="#212C3C" />
      <text x="-78" y="50" textAnchor="middle" fontSize="11" fill="white" fontFamily="Noto Sans TC, sans-serif">{t.flexibleLegacy.substring(0, 2)}</text>
      <text x="-78" y="64" textAnchor="middle" fontSize="11" fill="white" fontFamily="Noto Sans TC, sans-serif">{t.flexibleLegacy.substring(2)}</text>

      {/* Right Circle: Radius 35 */}
      <circle cx="78" cy="55" r="35" fill="#212C3C" />
      <text x="78" y="50" textAnchor="middle" fontSize="11" fill="white" fontFamily="Noto Sans TC, sans-serif">{t.currencyConfig.substring(0, 2)}</text>
      <text x="78" y="64" textAnchor="middle" fontSize="11" fill="white" fontFamily="Noto Sans TC, sans-serif">{t.currencyConfig.substring(2)}</text>
    </svg>
  </div>
);

const LegacyRoadmap = ({ t }: { t: any }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
    <h3 className="text-center text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">{t.threeGenPath}</h3>
    <div className="flex items-center justify-between relative px-12">
      <div className="absolute top-1/2 left-14 right-14 h-0.5 bg-slate-300 -z-0"></div>
      {[
        { id: 1, label: t.gen1, desc: t.gen1Desc, color: "bg-blue-600", text: "text-blue-700" },
        { id: 2, label: t.gen2, desc: t.gen2Desc, color: "bg-amber-500", text: "text-amber-600" },
        { id: 3, label: t.gen3, desc: t.gen3Desc, color: "bg-emerald-600", text: "text-emerald-700" }
      ].map(node => (
        <div key={node.id} className="flex flex-col items-center z-10 bg-slate-50 px-4 py-1 rounded-lg">
          <div className={`w-8 h-8 rounded-full ${node.color} text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white`}>{node.id}</div>
          <div className={`text-[10px] font-bold ${node.text} mt-1`}>{node.label}</div>
          <div className="text-[9px] text-slate-500">{node.desc}</div>
        </div>
      ))}
    </div>
  </div>
);

const PageHeader = ({ t }: { t: any }) => (
  <div className="border-b-2 border-amber-600 pb-2 mb-4 flex justify-between items-end">
    <div>
      <h1 className="text-2xl font-bold serif-font text-slate-900">{t.title}</h1>
      <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest">PRIVATE WEALTH PROPOSAL</p>
    </div>
    <div className="text-right">
      <div className="text-amber-600 font-bold text-lg">PB</div>
      <div className="text-[10px] text-slate-400">Generations of Trust</div>
    </div>
  </div>
);

const PageFooter = ({ data, t, pageNum, totalPages }: { data: ProposalData, t: any, pageNum: number, totalPages: number }) => {
  const smartTranslate = (text: string) => (t.lang === 'zh-HK' && HK_DATA_MAP[text]) ? HK_DATA_MAP[text] : text;
  return (
    <div className="absolute bottom-[12mm] left-[15mm] right-[15mm] border-t border-slate-200 pt-2 flex justify-between text-[9px] text-slate-400">
      <div>{smartTranslate(data.planName)} | v2.1</div>
      <div>Page {pageNum} / {totalPages}</div>
    </div>
  );
};

// --- Main Component ---

interface OutputDisplayProps {
  data: ProposalData;
  onBack: () => void;
  lang: Language;
  onToggleLanguage: () => void;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ data, onBack, lang, onToggleLanguage }) => {
  const [scale, setScale] = useState(0.8);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  // Helpers
  const smartTranslate = (text: string) => (lang === 'zh-HK' && HK_DATA_MAP[text]) ? HK_DATA_MAP[text] : text;
  const formatMoney = (val: number) => val.toLocaleString();
  const getAge = (year: number) => data.client.age + year;
  const getReturnRate = (val: number, basis = data.premium.total) => basis === 0 ? "0%" : ((val / basis) * 100).toFixed(0) + "%";

  // Promo Helpers
  const getRebateString = () => {
    const parts = [];
    if (data.promo.lumpSum.enabled) parts.push(`${t.rebateLumpSum} ${data.promo.lumpSum.percent}%`);
    if (data.promo.fiveYear.enabled) parts.push(`${t.rebate5Year} ${data.promo.fiveYear.percent}%`);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };
  const getPrepayString = () => !data.promo.prepay.enabled ? "N/A" : `${data.promo.prepay.rate}%`;
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  const getPrepayDeadlineString = () => (!data.promo.prepay.enabled || !data.promo.prepay.deadline) ? "" : `(${t.to} ${formatDate(data.promo.prepay.deadline)})`;
  const getGenBadgeStyle = (gen?: string) => {
    const safeGen = gen || "Gen 1";
    if (safeGen.includes("Gen 1")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (safeGen.includes("Gen 2")) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  };

  const generatePDF = async () => {
    setIsPdfMode(true);
    
    // Wait for state update and DOM reflow
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Wait for fonts to load (critical for PDF)
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Font loading check failed", e);
    }
    
    // Additional small buffer for complex layout
    await new Promise(resolve => setTimeout(resolve, 200));

    const element = contentRef.current;
    const opt = {
      margin: 0,
      filename: `${data.client.name}_Proposal.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        windowWidth: 1123, // A4 landscape px at 96 DPI
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => {
      setIsPdfMode(false);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-200">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow mx-4 mt-4 no-print z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm text-slate-600 hover:text-amber-600 flex items-center font-medium transition-colors">
            ← {t.editData}
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <button onClick={onToggleLanguage} className="text-xs bg-slate-100 px-3 py-1 rounded hover:bg-slate-200 text-slate-600 font-bold border border-slate-300 transition-colors">
            {lang === 'zh-CN' ? '繁體中文' : '简体中文'}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Zoom:</span>
            <input type="range" min="0.5" max="1.2" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-24 cursor-pointer accent-amber-600" />
          </div>
          <button onClick={generatePDF} className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded shadow font-bold flex items-center gap-2 transition-colors">
             {t.downloadPDF}
          </button>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className="flex-1 overflow-auto flex justify-center items-start py-8">
        <div style={{ 
            transform: isPdfMode ? 'none' : `scale(${scale})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out'
          }}>
          
          <div 
            ref={contentRef}
            className={`flex flex-col items-center ${isPdfMode ? 'gap-0' : 'gap-8'}`}
            style={{ width: '297mm' }} 
          >
            {/* --- PAGE 1 --- */}
            <div 
              className={`relative bg-white ${isPdfMode ? '' : 'shadow-2xl'} overflow-hidden`}
              style={{ width: '297mm', height: '210mm', padding: '15mm' }}
            >
              <PageHeader t={t} />

              <div className="grid grid-cols-12 gap-8 h-full pb-8">
                {/* Left Column */}
                <div className="col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-200 h-[140mm] flex flex-col justify-between">
                  <div>
                    <h2 className="text-xs font-bold text-amber-600 uppercase mb-3 border-b border-amber-200 pb-1">{t.clientOverview}</h2>
                    <div className="mb-4">
                      <div className="text-xl font-bold text-slate-800 mb-1 line-clamp-1">{data.client.name}</div>
                      <div className="text-xs text-slate-500">{t.entryAge}: <span className="font-bold text-slate-700">{data.client.age} {t.ageUnit}</span></div>
                    </div>

                    <div className="space-y-2 text-xs mb-4">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500 flex-shrink-0 mr-2">{t.planName}</span>
                        <span className="font-bold text-slate-800 text-right break-words">{smartTranslate(data.planName)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">{t.totalPremium}</span>
                        <span className="font-bold text-slate-800">{formatMoney(data.premium.total)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">{t.paymentType}</span>
                        <span className="font-bold text-slate-800">{data.premium.paymentType}</span>
                      </div>

                      {/* Legacy Features Display */}
                      {(data.legacy.secondOwner || data.legacy.successorInsured) && (
                        <div className="pt-2 mt-2 border-t border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t.policyLegacyFeatures}</div>
                          <div className="flex flex-wrap gap-2">
                            {data.legacy.secondOwner && (
                              <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[10px] font-bold shadow-sm">
                                ✓ {t.secondOwner}
                              </span>
                            )}
                            {data.legacy.successorInsured && (
                              <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[10px] font-bold shadow-sm">
                                ✓ {t.successorInsured}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex-1 flex flex-col justify-end">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase text-center mb-2">{t.coreValues}</h3>
                    <Infographic t={t} />
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-span-8 space-y-6">
                  {/* Scenario A */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                       <h3 className="text-base font-bold text-slate-800">{t.scenarioA}</h3>
                    </div>
                    {/* Increased text-sm to text-base (16px) for visibility */}
                    <table className="w-full text-base text-right">
                      <thead className="bg-slate-900 text-white uppercase tracking-wider">
                        <tr>
                          <th className="p-3 text-left">{t.age}</th>
                          <th className="p-3 text-left">{t.policyYear}</th>
                          <th className="p-3">{t.surrenderValue}</th>
                          <th className="p-3">{t.deathBenefit}</th>
                          <th className="p-3">{t.totalReturn}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {YEAR_KEYS.map((key, index) => (
                          <tr key={key}>
                            <td className="p-3 text-left font-bold text-slate-700">{getAge(YEAR_VALS[index])}</td>
                            <td className="p-3 text-left text-slate-500">{t.startYear} {YEAR_VALS[index]} {t.year}</td>
                            <td className="p-3 font-mono">{formatMoney(data.scenarioA[key].surrender)}</td>
                            <td className="p-3 font-mono">{formatMoney(data.scenarioA[key].death)}</td>
                            <td className="p-3 font-bold text-emerald-600">{getReturnRate(data.scenarioA[key].surrender)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Scenario B */}
                  <div className="bg-white rounded-lg shadow-sm border border-amber-100 overflow-hidden">
                    <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex justify-between items-center">
                      <h3 className="text-base font-bold text-amber-800">{t.scenarioB}</h3>
                      <span className="text-sm text-amber-700 font-bold bg-white px-2 py-1 rounded border border-amber-200 shadow-sm">
                        {t.annualWithdrawal}: {formatMoney(data.scenarioB.annualWithdrawal)}
                      </span>
                    </div>
                    <table className="w-full text-base text-right">
                      <thead className="bg-slate-900 text-white uppercase tracking-wider">
                        <tr>
                          <th className="p-3 text-left">{t.age}</th>
                          <th className="p-3 text-left">{t.policyYear}</th>
                          <th className="p-3">{t.cumulativeWithdrawal}</th>
                          <th className="p-3">{t.remainingValue}</th>
                          <th className="p-3">{t.totalReturn}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {YEAR_KEYS.map((key, index) => (
                          <tr key={key}>
                            <td className="p-3 text-left font-bold text-slate-700">{getAge(YEAR_VALS[index])}</td>
                            <td className="p-3 text-left text-slate-500">{t.startYear} {YEAR_VALS[index]} {t.year}</td>
                            <td className="p-3 font-mono text-amber-700 font-bold">{formatMoney(data.scenarioB[key].cumulative)}</td>
                            <td className="p-3 font-mono">{formatMoney(data.scenarioB[key].remaining)}</td>
                            <td className="p-3 font-bold text-emerald-600">
                              {getReturnRate(data.scenarioB[key].cumulative + data.scenarioB[key].remaining)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <PageFooter data={data} t={t} pageNum={1} totalPages={2} />
            </div>

            {/* --- PAGE 2 --- */}
            <div 
              className={`relative bg-white ${isPdfMode ? '' : 'shadow-2xl'} overflow-hidden`}
              style={{ width: '297mm', height: '210mm', padding: '15mm' }}
            >
              <PageHeader t={t} />

              <div className="mb-4">
                <h3 className="text-sm font-bold text-amber-600 border-l-4 border-amber-500 pl-2 mb-3">{t.scenarioC}</h3>
                <LegacyRoadmap t={t} />
              </div>

              {/* Goal Table */}
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-4">
                {/* Increased text-xs to text-sm */}
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-white uppercase tracking-wider">
                    <tr>
                      <th className="p-2 text-left">{t.age}</th>
                      <th className="p-2 text-left">{t.policyYear}</th>
                      <th className="p-2 text-left">{t.generation}</th>
                      <th className="p-2 text-left w-1/5">{t.purpose}</th>
                      <th className="p-2 text-right">{t.annualAmt}</th>
                      <th className="p-2 text-right">{t.cumulativeWithdrawal}</th>
                      <th className="p-2 text-right">{t.remainingValue}</th>
                      <th className="p-2 text-right">{t.totalReturn}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {data.scenarioC.goals.map((goal, idx) => {
                      const startAge = data.client.age + goal.policyYearStart;
                      const endAge = data.client.age + goal.policyYearEnd;
                      const totalReturn = getReturnRate((goal.cumulative || 0) + (goal.remainingValue || 0));
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 font-bold text-slate-900">
                            {startAge === endAge ? startAge : `${startAge}-${endAge}`}
                          </td>
                          <td className="p-2 text-slate-500">
                            {t.startYear} {goal.policyYearStart === goal.policyYearEnd ? goal.policyYearStart : `${goal.policyYearStart}-${goal.policyYearEnd}`} {t.year}
                          </td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getGenBadgeStyle(goal.generation)}`}>
                              {goal.genLabel || goal.generation || "Gen 1"}
                            </span>
                          </td>
                          <td className="p-2 font-medium text-slate-800 line-clamp-1">{smartTranslate(goal.purpose)}</td>
                          <td className="p-2 text-right font-mono text-amber-700 font-bold">{formatMoney(goal.amount)}</td>
                          <td className="p-2 text-right font-mono text-slate-500">{formatMoney(goal.cumulative || 0)}</td>
                          <td className="p-2 text-right font-mono text-slate-500">{formatMoney(goal.remainingValue || 0)}</td>
                          <td className="p-2 text-right font-bold text-emerald-600">{totalReturn}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Promo Info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-2 rounded border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{t.rebate}</div>
                    <div className="text-sm font-bold text-slate-800">{getRebateString()}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{t.prepayInterest}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-slate-800">{getPrepayString()}</span>
                      <span className="text-[10px] text-red-500 font-medium">{getPrepayDeadlineString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[8px] text-slate-400 text-justify leading-tight">
                <strong className="text-slate-500">{t.disclaimerTitle}</strong> {t.disclaimerText}
              </div>
              
              <PageFooter data={data} t={t} pageNum={2} totalPages={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};