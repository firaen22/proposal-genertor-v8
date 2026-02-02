import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProposalData } from '../../types';

// Define the shape of the 't' translation object as used in OutputDisplay
// Using 'any' for now to avoid strict typing issues with the large translation object, 
// but in production this should be properly typed or shared.
type Translation = any;

const YEAR_KEYS = ['year10', 'year20', 'year30', 'year40'] as const;
const YEAR_VALS = [10, 20, 30, 40];

// Helper functions duplicated to avoid tight coupling or export issues
const formatMoney = (val: number) => val.toLocaleString();
const getReturnRate = (val: number, basis: number) => basis === 0 ? "0%" : ((val / basis) * 100).toFixed(0) + "%";
const getAge = (currentAge: number, yearToAdd: number) => currentAge + yearToAdd;

// Font URL - Using Google Fonts repo as a source. 
// Ideally, this should be hosted on the same domain to avoid CORS or stability issues.
const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC-Bold.ttf';

export const generateNativePDF = async (data: ProposalData, t: Translation) => {
    // 1. Initialize DB
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // 2. Load and add font
    try {
        const response = await fetch(FONT_URL);
        if (!response.ok) throw new Error('Failed to fetch font');
        const buffer = await response.arrayBuffer();

        // Convert base64
        const base64Font = arrayBufferToBase64(buffer);

        // Add font
        doc.addFileToVFS('NotoSansTC-Bold.ttf', base64Font);
        doc.addFont('NotoSansTC-Bold.ttf', 'NotoSansTC', 'bold');
        doc.setFont('NotoSansTC', 'bold');
    } catch (e) {
        console.error("Font loading failed, falling back to standard font", e);
        // Be careful: Standard fonts don't support Chinese characters.
        // We might want to alert the user or try a system font if this was Node, but in browser we need embedded.
        alert("Warning: Could not load Chinese font. Text may not appear correctly.");
    }

    // --- Page 1 ---

    // Header
    drawHeader(doc, t);

    // Client Info Box (Left Column equivalent)
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const clientInfoX = 15;
    let clientInfoY = 45;

    doc.setTextColor(184, 134, 11); // Amber
    doc.text(t.clientOverview || "CLIENT OVERVIEW", clientInfoX, clientInfoY);
    doc.setDrawColor(255, 200, 100);
    doc.line(clientInfoX, clientInfoY + 2, clientInfoX + 60, clientInfoY + 2);

    clientInfoY += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(data.client.name, clientInfoX, clientInfoY);

    clientInfoY += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t.entryAge}: ${data.client.age} ${t.ageUnit}`, clientInfoX, clientInfoY);

    // Plan Details
    clientInfoY += 10;
    drawLabelValue(doc, t.planName, data.planName, clientInfoX, clientInfoY);
    clientInfoY += 6;
    drawLabelValue(doc, t.totalPremium, formatMoney(data.premium.total), clientInfoX, clientInfoY);
    clientInfoY += 6;
    drawLabelValue(doc, t.paymentType, data.premium.paymentType, clientInfoX, clientInfoY);

    // Scenario A Table (Right Column)
    const tableStartX = 90;
    doc.text(t.scenarioA || "Scenario A", tableStartX, 45);

    autoTable(doc, {
        startY: 50,
        margin: { left: tableStartX },
        head: [[t.age, t.policyYear, t.surrenderValue, t.deathBenefit, t.totalReturn]],
        body: YEAR_KEYS.map((key, i) => [
            getAge(data.client.age, YEAR_VALS[i]),
            `${t.startYear} ${YEAR_VALS[i]} ${t.year}`,
            formatMoney(data.scenarioA[key].surrender),
            formatMoney(data.scenarioA[key].death),
            getReturnRate(data.scenarioA[key].surrender, data.premium.total)
        ]),
        theme: 'grid',
        styles: { font: 'NotoSansTC', fontStyle: 'bold' },
        headStyles: { fillColor: [33, 44, 60] }, // Dark Slate
    });

    // Scenario B Table
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 15;

    doc.text(`${t.scenarioB}`, tableStartX, finalY - 5);
    doc.setFontSize(9);
    doc.text(`${t.annualWithdrawal}: ${formatMoney(data.scenarioB.annualWithdrawal)}`, tableStartX + 40, finalY - 5);

    autoTable(doc, {
        startY: finalY,
        margin: { left: tableStartX },
        head: [[t.age, t.policyYear, t.cumulativeWithdrawal, t.remainingValue, t.totalReturn]],
        body: YEAR_KEYS.map((key, i) => [
            getAge(data.client.age, YEAR_VALS[i]),
            `${t.startYear} ${YEAR_VALS[i]} ${t.year}`,
            formatMoney(data.scenarioB[key].cumulative),
            formatMoney(data.scenarioB[key].remaining),
            getReturnRate(data.scenarioB[key].cumulative + data.scenarioB[key].remaining, data.premium.total)
        ]),
        theme: 'grid',
        styles: { font: 'NotoSansTC', fontStyle: 'bold' },
        headStyles: { fillColor: [33, 44, 60] },
    });

    // Footer Page 1
    drawFooter(doc, data, t, 1, 2);

    // --- Page 2 ---
    doc.addPage();
    drawHeader(doc, t);

    // Scenario C Header
    doc.setTextColor(184, 134, 11);
    doc.setFontSize(12);
    doc.text(t.scenarioC || "Scenario C", 15, 35);

    // Scenario C Table
    autoTable(doc, {
        startY: 40,
        head: [[t.age, t.policyYear, t.generation, t.purpose, t.annualAmt, t.cumulativeWithdrawal, t.remainingValue, t.totalReturn]],
        body: data.scenarioC.goals.map(goal => {
            const startAge = data.client.age + goal.policyYearStart;
            const endAge = data.client.age + goal.policyYearEnd;
            return [
                startAge === endAge ? startAge : `${startAge} - ${endAge}`,
                `${t.startYear} ${goal.policyYearStart === goal.policyYearEnd ? goal.policyYearStart : `${goal.policyYearStart}-${goal.policyYearEnd}`} ${t.year}`,
                goal.generation || "Gen 1",
                goal.purpose,
                formatMoney(goal.amount),
                formatMoney(goal.cumulative || 0),
                formatMoney(goal.remainingValue || 0),
                getReturnRate((goal.cumulative || 0) + (goal.remainingValue || 0), data.premium.total)
            ];
        }),
        theme: 'grid',
        styles: { font: 'NotoSansTC', fontStyle: 'bold', fontSize: 9 },
        headStyles: { fillColor: [33, 44, 60] },
    });

    // Footer Page 2
    drawFooter(doc, data, t, 2, 2);

    doc.save(`${data.client.name}_Proposal_Native.pdf`);
};

// Utils
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function drawHeader(doc: jsPDF, t: any) {
    doc.setFont("NotoSansTC", 'bold');
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text(t.title, 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("PRIVATE WEALTH PROPOSAL", 15, 25);

    doc.setLineWidth(0.5);
    doc.setDrawColor(184, 134, 11); // pbGold
    doc.line(15, 28, 282, 28);
}

function drawLabelValue(doc: jsPDF, label: string, value: string, x: number, y: number) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(label, x, y);

    const labelWidth = doc.getTextWidth(label);
    doc.setTextColor(0, 0, 0);
    doc.text(value, x + labelWidth + 5, y);
}

function drawFooter(doc: jsPDF, data: ProposalData, t: any, pageNum: number, totalPages: number) {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`${data.planName} | v2.1`, 15, pageHeight - 10);
    doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth - 30, pageHeight - 10);
}
