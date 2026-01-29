import { ProposalData } from "../types";

export const generateLocalProposal = (data: ProposalData): string => {
  const rebateParts = [];
  if (data.promo.lumpSum.enabled) rebateParts.push(`一笔过 ${data.promo.lumpSum.percent}\\%`);
  if (data.promo.fiveYear.enabled) rebateParts.push(`5年缴 ${data.promo.fiveYear.percent}\\%`);
  const rebateString = rebateParts.length > 0 ? rebateParts.join(", ") : "N/A";

  const prepayString = data.promo.prepay.enabled 
    ? `${data.promo.prepay.rate}\\%`
    : "N/A";
  
  const prepayNote = data.promo.prepay.enabled ? `(注意: 优惠截止至 ${data.promo.prepay.deadline})` : "";

  const getReturnRate = (val: number) => {
    if (data.premium.total === 0) return "0\\%";
    return ((val / data.premium.total) * 100).toFixed(0) + "\\%";
  };

  const getScenarioCReturn = (cumulative: number, remaining: number = 0) => {
    if (data.premium.total === 0) return "0\\%";
    return (((cumulative + remaining) / data.premium.total) * 100).toFixed(0) + "\\%";
  };

  const getAge = (year: number) => {
    return data.client.age + year;
  };

  // Generate rows for Scenario C with Generation, Remaining, Return
  const scenarioCRows = data.scenarioC.goals.map(goal => {
    const gen = goal.genLabel || goal.generation || "-";
    const totalReturn = getScenarioCReturn(goal.cumulative || goal.amount, goal.remainingValue);
    const remVal = goal.remainingValue ? goal.remainingValue.toLocaleString() : "0";
    const annual = goal.amount.toLocaleString();
    const cum = (goal.cumulative || goal.amount).toLocaleString();
    
    const startAge = data.client.age + goal.policyYearStart;
    const endAge = data.client.age + goal.policyYearEnd;
    const ageDisplay = startAge === endAge ? `${startAge}` : `${startAge}-${endAge}`;
    const yearDisplay = goal.policyYearStart === goal.policyYearEnd ? `第 ${goal.policyYearStart} 年` : `第 ${goal.policyYearStart}-${goal.policyYearEnd} 年`;
    
    // Latex table row
    return `${ageDisplay} & ${yearDisplay} & ${gen} & ${goal.purpose} & ${annual} & ${cum} & ${remVal} & ${totalReturn} \\\\`;
  }).join("\n");

  return `\\documentclass[a4paper,12pt,landscape]{article}
\\usepackage{geometry}
\\geometry{top=2.0cm, bottom=2.0cm, left=2.0cm, right=2.0cm}
\\usepackage{fontspec}
\\usepackage{xeCJK}
\\usepackage{babel}
\\usepackage{tikz}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{xcolor}
\\usepackage{colortbl}
\\usepackage{graphicx}
\\usepackage{float}

% Fonts Configuration
\\setmainfont{Noto Sans}
\\setCJKmainfont{Noto Sans CJK SC}

% Color Definitions
\\definecolor{pbGold}{RGB}{184, 134, 11}
\\definecolor{pbDark}{RGB}{33, 44, 60}
\\definecolor{pbLight}{RGB}{245, 245, 245}

\\title{\\bfseries\\color{pbDark} 私人财富管理建议书}
\\author{PRIVATE WEALTH PROPOSAL}
\\date{\\today}

\\begin{document}

\\maketitle
\\thispagestyle{empty}

% --- Page 1 ---

\\section*{客户概览: ${data.client.name}}

\\begin{minipage}{0.35\\textwidth}
    \\textbf{尊贵的 ${data.client.name} 阁下} (年龄: ${data.client.age})，感谢您选择我们的资产托管服务。
    
    \\vspace{1em}
    \\textbf{保费资讯:}
    \\begin{itemize}
        \\item 总保费: USD ${data.premium.total.toLocaleString()}
        \\item 缴费方式: ${data.premium.paymentType}
    \\end{itemize}

    \\vspace{2em}
    \\begin{center}
    \\begin{tikzpicture}[scale=0.8]
        % Circular Infographic
        \\node[circle, draw=pbGold, line width=2pt, minimum size=3cm, align=center, fill=pbGold!10] (core) at (0,0) {\\textbf{财富}\\\\\\textbf{传承}};
        
        \\node[circle, fill=pbDark, text=white, minimum size=2cm, align=center] (growth) at (90:3cm) {财富\\\\增值};
        \\node[circle, fill=pbDark, text=white, minimum size=2cm, align=center] (heritage) at (210:3cm) {灵活\\\\传承};
        \\node[circle, fill=pbDark, text=white, minimum size=2cm, align=center] (currency) at (330:3cm) {货币\\\\配置};
        
        \\draw[->, >=latex, line width=1.5pt, pbGold] (core) -- (growth);
        \\draw[->, >=latex, line width=1.5pt, pbGold] (core) -- (heritage);
        \\draw[->, >=latex, line width=1.5pt, pbGold] (core) -- (currency);
    \\end{tikzpicture}
    \\end{center}
\\end{minipage}
\\hfill
\\begin{minipage}{0.6\\textwidth}
    \\section*{情境 A: 资本积累}
    \\renewcommand{\\arraystretch}{1.3}
    \\begin{tabular}{r|p{2cm}|r|r|r}
    \\hline
    \\rowcolor{pbDark!10} \\textbf{年龄} & \\textbf{年度} & \\textbf{退保(USD)} & \\textbf{身故(USD)} & \\textbf{回报} \\\\
    \\hline
    ${getAge(10)} & 第 10 年 & ${data.scenarioA.year10.surrender.toLocaleString()} & ${data.scenarioA.year10.death.toLocaleString()} & ${getReturnRate(data.scenarioA.year10.surrender)} \\\\
    ${getAge(20)} & 第 20 年 & ${data.scenarioA.year20.surrender.toLocaleString()} & ${data.scenarioA.year20.death.toLocaleString()} & ${getReturnRate(data.scenarioA.year20.surrender)} \\\\
    ${getAge(30)} & 第 30 年 & ${data.scenarioA.year30.surrender.toLocaleString()} & ${data.scenarioA.year30.death.toLocaleString()} & ${getReturnRate(data.scenarioA.year30.surrender)} \\\\
    ${getAge(40)} & 第 40 年 & ${data.scenarioA.year40.surrender.toLocaleString()} & ${data.scenarioA.year40.death.toLocaleString()} & ${getReturnRate(data.scenarioA.year40.surrender)} \\\\
    \\hline
    \\end{tabular}

    \\vspace{1em}
    
    \\section*{情境 B: 被动收入}
    \\textit{年提取: USD ${data.scenarioB.annualWithdrawal.toLocaleString()} (第 ${data.scenarioB.withdrawalStartYear} 年起)}
    
    \\vspace{0.5em}
    \\begin{tabular}{r|p{2cm}|r|r|r}
    \\hline
    \\rowcolor{pbDark!10} \\textbf{年龄} & \\textbf{年度} & \\textbf{累计(USD)} & \\textbf{剩余(USD)} & \\textbf{回报} \\\\
    \\hline
    ${getAge(10)} & 第 10 年 & ${data.scenarioB.year10.cumulative.toLocaleString()} & ${data.scenarioB.year10.remaining.toLocaleString()} & ${getReturnRate(data.scenarioB.year10.cumulative + data.scenarioB.year10.remaining)} \\\\
    ${getAge(20)} & 第 20 年 & ${data.scenarioB.year20.cumulative.toLocaleString()} & ${data.scenarioB.year20.remaining.toLocaleString()} & ${getReturnRate(data.scenarioB.year20.cumulative + data.scenarioB.year20.remaining)} \\\\
    ${getAge(30)} & 第 30 年 & ${data.scenarioB.year30.cumulative.toLocaleString()} & ${data.scenarioB.year30.remaining.toLocaleString()} & ${getReturnRate(data.scenarioB.year30.cumulative + data.scenarioB.year30.remaining)} \\\\
    ${getAge(40)} & 第 40 年 & ${data.scenarioB.year40.cumulative.toLocaleString()} & ${data.scenarioB.year40.remaining.toLocaleString()} & ${getReturnRate(data.scenarioB.year40.cumulative + data.scenarioB.year40.remaining)} \\\\
    \\hline
    \\end{tabular}
\\end{minipage}

\\newpage

% --- Page 2 ---

\\section*{情境 C: 人生目标规划 (富足三代图谱)}

根据阁下不同的人生阶段，我们预设了以下资金提取目标，以配合家族三代的财务需求。

\\begin{table}[H]
\\centering
\\renewcommand{\\arraystretch}{1.5}
\\scriptsize
\\begin{tabular}{c|l|l|p{6cm}|r|r|r|r}
\\hline
\\rowcolor{pbDark!10} \\textbf{岁} & \\textbf{年度} & \\textbf{世代} & \\textbf{用途} & \\textbf{年提取 (USD)} & \\textbf{累计 (USD)} & \\textbf{剩余 (USD)} & \\textbf{总回报率} \\\\
\\hline
${scenarioCRows}
\\hline
\\end{tabular}
\\caption{人生目标资金规划}
\\end{table}

\\vfill

\\section*{推广优惠}

\\begin{description}
    \\item[回赠优惠:] ${rebateString}
    \\item[预缴利率:] ${prepayString} ${prepayNote}
\\end{description}

\\vspace{2em}
\\noindent
\\rule{\\linewidth}{0.5pt}
\\vspace{0.5em}
\\scriptsize
\\textbf{免责声明:} 本文件仅供参考，不构成任何要约或招揽。所有红利及分红均为非保证。投资涉及风险，阁下应留意美息走势对预缴利率的影响。

\\end{document}`;
};