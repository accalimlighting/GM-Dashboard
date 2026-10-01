import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  PieChart, 
  Calendar, 
  AlertCircle,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Table,
  BarChart2,
  Layers,
  Users,
  Award,
  Package,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  ReferenceLine,
  LabelList
} from 'recharts';

// --- DATA SECTION ---

// Period labels: Jan–Sep (through Q3) of each year, from the Sep 30 P&L exports.
const PRIOR_LABEL = '2025 YTD';
const CURRENT_LABEL = '2026 YTD';
const PERIOD_LABEL = 'Q3 2026 YTD (Jan–Sep)';

const YOY_DATA = [
  { 
    category: "Revenue & Profit",
    items: [
      { name: "Total Sales", y2025: 13858554.30, y2026: 12397099.10, format: "currency", invertColor: false },
      { name: "Cost of Goods Sold", y2025: 8930504.75, y2026: 7009350.52, format: "currency", invertColor: true },
      { name: "Gross Profit", y2025: 4928049.55, y2026: 5387748.58, format: "currency", invertColor: false },
      { name: "Gross Margin", y2025: 35.6, y2026: 43.5, format: "percent", invertColor: false },
      { name: "EBITDA", y2025: 315428.75, y2026: -107692.39, format: "currency", invertColor: false },
      { name: "EBITDA Margin", y2025: 2.3, y2026: -0.9, format: "percent", invertColor: false },
      { name: "Net Income", y2025: 118061.29, y2026: -435877.09, format: "currency", invertColor: false },
    ]
  },
  {
    category: "Key Expense Drivers",
    items: [
      { name: "Labor Expenses", y2025: 1814794.52, y2026: 1761804.15, format: "currency", invertColor: true },
      { name: "Commissions", y2025: 1150080.79, y2026: 2087693.15, format: "currency", invertColor: true },
      { name: "Tariffs & Duties", y2025: 2488708.92, y2026: 55680.62, format: "currency", invertColor: true },
      { name: "COGS - Other", y2025: 68558.27, y2026: 1112300.48, format: "currency", invertColor: true },
      { name: "Overage Expense", y2025: 278771.43, y2026: 93828.38, format: "currency", invertColor: true },
      { name: "Interest Expense", y2025: 200582.51, y2026: 330372.11, format: "currency", invertColor: true },
    ]
  },
  {
    category: "Operational Costs",
    items: [
      { name: "Freight In", y2025: 431071.22, y2026: 20799.30, format: "currency", invertColor: true },
      { name: "Freight Out", y2025: 255367.14, y2026: 283641.91, format: "currency", invertColor: true },
      { name: "Advertising", y2025: 197154.46, y2026: 233484.33, format: "currency", invertColor: true },
      { name: "Product Safety Approvals", y2025: 95973.22, y2026: 222902.32, format: "currency", invertColor: true },
      { name: "R&D", y2025: 68692.67, y2026: 170391.64, format: "currency", invertColor: true },
      { name: "Trade Shows", y2025: 59225.26, y2026: 52625.79, format: "currency", invertColor: true },
      { name: "Travel", y2025: 140172.90, y2026: 164883.68, format: "currency", invertColor: true },
    ]
  }
];

const HISTORY_DATA = [
  { month: PRIOR_LABEL, sales: 13858554, marginPct: 35.6, ebitda: 315429 },
  { month: CURRENT_LABEL, sales: 12397099, marginPct: 43.5, ebitda: -107692 },
];

const TOTAL_REVENUE_PRIOR = 13858554.30;
const TOTAL_REVENUE_CURRENT = 12397099.10;
const GROSS_MARGIN_PRIOR = 35.6;
const GROSS_MARGIN_CURRENT = 43.5;
const GROSS_PROFIT_PRIOR = 4928049.55;
const GROSS_PROFIT_CURRENT = 5387748.58;
const EBITDA_PRIOR = 315428.75;
const EBITDA_CURRENT = -107692.39;
const NET_INCOME_PRIOR = 118061.29;
const NET_INCOME_CURRENT = -435877.09;

// Full-year 2025 revenue; still used as the denominator for the FY2025
// customer / product tabs until a Q3 2026 YTD export is available.
const TOTAL_REVENUE_FY2025 = 17096341.07;

const ACCESS_STORAGE_KEY = 'acclaim-dashboard-access';
const APP_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || '';

const formatCompactCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(abs / 1000).toFixed(0)}k`;
  return `$${abs.toFixed(0)}`;
};

const formatSignedCompactCurrency = (value) =>
  `${value < 0 ? '-' : ''}${formatCompactCurrency(value)}`;

const calculatePercentChange = (current, prior) => {
  if (prior === 0) return 0;
  return ((current - prior) / Math.abs(prior)) * 100;
};

const formatDeltaLabel = (percentValue, dollarDiff) => {
  const pctText = `${percentValue >= 0 ? '+' : ''}${percentValue.toFixed(1)}%`;
  const diffText = `${dollarDiff >= 0 ? '+' : '-'}${formatCompactCurrency(Math.abs(dollarDiff))}`;
  return (
    <>
      Vs '25 YTD: <span className="font-bold">{pctText}</span> ({diffText})
    </>
  );
};

const SORT_TYPES = {
  number: 'number',
  text: 'text',
};

const compareValues = (a, b, type = SORT_TYPES.number) => {
  const valA = a ?? (type === SORT_TYPES.text ? '' : 0);
  const valB = b ?? (type === SORT_TYPES.text ? '' : 0);
  if (type === SORT_TYPES.text) {
    return valA.toString().localeCompare(valB.toString(), undefined, { sensitivity: 'base' });
  }
  return valA - valB;
};

// --- UPDATED CHART DATA (Q3 2026 YTD) ---

// 1. REVENUE ALLOCATION PIE (2026 YTD spend; net loss shown separately since a pie can't hold a negative slice)
const REVENUE_PIE_DATA = [
  { name: 'COGS', value: 7009350.52, color: '#EF4444' }, // Red
  { name: 'Labor', value: 1761804.15, color: '#F59E0B' }, // Orange
  { name: 'Selling', value: 2972215.75, color: '#FCD34D' }, // Yellow
  { name: 'OpEx (Admin + Facility)', value: 761421.07, color: '#6366F1' }, // Indigo
  { name: 'Interest/Tax', value: 328184.70, color: '#94A3B8' }, // Gray
];

// 2. COST EFFICIENCY (% of revenue)
const COST_EFFICIENCY_DATA = [
  { name: 'COGS', y2025: 64.4, y2026: 56.5 },
  { name: 'Labor', y2025: 13.1, y2026: 14.2 },
  { name: 'Selling', y2025: 14.6, y2026: 24.0 },
  { name: 'Admin/Fac', y2025: 5.6, y2026: 6.1 },
];

// Top 5 by 2026 YTD spend
const TOP_EXPENSES_DATA = [
  { name: 'Commissions', y2025: 1150080.79, y2026: 2087693.15 },
  { name: 'Salaries', y2025: 1308565.29, y2026: 1417077.89 },
  { name: 'COGS - Other', y2025: 68558.27, y2026: 1112300.48 },
  { name: 'Freight Out', y2025: 255367.14, y2026: 283641.91 },
  { name: 'Temp Help', y2025: 416379.59, y2026: 239673.31 },
];

const LABOR_EFFICIENCY_DATA = [
  { year: PRIOR_LABEL, labor: 1814794.52, sales: 13858554.30, ratio: 7.64 },
  { year: CURRENT_LABEL, labor: 1761804.15, sales: 12397099.10, ratio: 7.04 },
];

// TOP 20 CUSTOMERS — Q3 2026 (Jul–Sep) invoiced sales net of credit memos.
// Source: Acumatica AR invoice export "Q3 RESULTS 2026.xlsx", sheet "Q3 JUL-SEPT 2026 INVOICE".
const CUSTOMER_PERIOD_LABEL = 'Q3 2026 (Jul–Sep)';
const CUSTOMER_PERIOD_TOTAL = 4518778.37; // all invoices in the export, used as the share denominator
const TOP_CUSTOMERS_DATA = [
  { rank: 1, name: "GRAYBAR", value: 556183.83 },
  { rank: 2, name: "AMERICAN ELECTRIC SUPPLY", value: 195134.25 },
  { rank: 3, name: "RITE LITES", value: 189177.69 },
  { rank: 4, name: "DISNEYLAND RESORT - DWSS AP", value: 187649.43 },
  { rank: 5, name: "ANIXTER POWER SOLUTIONS", value: 164510.21 },
  { rank: 6, name: "LUMENTENDER CONTROL SOLUCTIONS", value: 159207.92 },
  { rank: 7, name: "RIMMER LIGHTING", value: 148260.48 },
  { rank: 8, name: "POWER DESIGN RESOURCES", value: 125084.80 },
  { rank: 9, name: "REGENCY LIGHTING", value: 124159.40 },
  { rank: 10, name: "LITEMOR", value: 119966.60 },
  { rank: 11, name: "CED - MILLER ELECTRIC", value: 118676.60 },
  { rank: 12, name: "SKYLINE ARTS LLC", value: 102013.96 },
  { rank: 13, name: "LED SMITH / LED SYSTEMS", value: 83718.00 },
  { rank: 14, name: "JOSEPH PRODUCTIONS, INC.", value: 83200.00 },
  { rank: 15, name: "PLATT .COM", value: 80473.00 },
  { rank: 16, name: "THE LOEB ELECTRIC CO", value: 78832.93 },
  { rank: 17, name: "MAYER ELECTRIC  SUPPLY", value: 66933.45 },
  { rank: 18, name: "MCNAUGHTON-MCKAY ELECTRIC", value: 61281.24 },
  { rank: 19, name: "SOLOTECH US", value: 58343.62 },
  { rank: 20, name: "CED- CLEVELAND", value: 53696.88 },
];
const TOP_CUSTOMERS_TOTAL = TOP_CUSTOMERS_DATA.reduce((sum, c) => sum + c.value, 0);

// PRODUCT ANALYSIS DATA (Updated with ALL ACL- Classes)
const PRODUCT_CLASS_DATA = [
  { name: "Flood", sales: 2228072.74, margin: 62.49 },
  { name: "Linear", sales: 1395352.23, margin: 74.26 },
  { name: "Drivers", sales: 630723.55, margin: 67.16 },
  { name: "Accessories", sales: 541433.17, margin: 71.20 },
  { name: "Flex Tape", sales: 518784.26, margin: 81.70 },
  { name: "Flex Tube", sales: 613610.00, margin: 77.75 },
  { name: "Control", sales: 398791.72, margin: 50.78 },
  { name: "Image Proj", sales: 455530.00, margin: 47.84 },
  { name: "Non-Inv", sales: 254322.98, margin: 100.00 },
  { name: "Direct View", sales: 222055.01, margin: 66.65 },
  { name: "Cable/Conn", sales: 194637.97, margin: 64.93 },
  { name: "Downlights", sales: 51859.95, margin: 34.95 },
  { name: "Power", sales: 17638.57, margin: 72.58 },
  { name: "Parts", sales: 10772.20, margin: 65.51 },
  { name: "LED Lamps", sales: 29101.80, margin: 57.88 },
].sort((a, b) => b.sales - a.sales);

const TOP_PRODUCTS_DATA = [
  { rank: 1, sku: "DSW-221-AADN-MC", desc: "Dyna Drum SO 3500K White-Marine", sales: 748151.00 },
  { rank: 2, sku: "PIL19A-CEN", desc: "Gobo Projector w/ Barn Doors", sales: 559760.00 },
  { rank: 3, sku: "DDJ-241-ACIN", desc: "Dyna Drum HO QW4 10°", sales: 360056.50 },
  { rank: 4, sku: "XTA4188", desc: "Linear XTR SO 1 10x35 QW6", sales: 317446.40 },
  { rank: 5, sku: "UNB-211-ADRN", desc: "Unity S1 10 Deg SF Black", sales: 228173.00 },
  { rank: 6, sku: "DSC-241-ACIN", desc: "Dyna Drum SO QW4 10° Gray", sales: 182160.00 },
  { rank: 7, sku: "FLEXOHI24", desc: "Flex One HO Interior 2400K", sales: 141562.14 },
  { rank: 8, sku: "PBA-243-DTLN", desc: "Pixel Bar Flat 4' Spectrum RGBW", sales: 128848.00 },
  { rank: 9, sku: "DDV-221-LCIN", desc: "Dyna Drum EO QW-4K 10 OLS", sales: 123520.00 },
  { rank: 10, sku: "PBA-242-DTLN", desc: "Pixel Bar Round 4' Spectrum RGBW", sales: 122249.20 },
  { rank: 11, sku: "DDSSL20", desc: "Dyna Drum SO Spread Lens 20°", sales: 120563.19 },
  { rank: 12, sku: "MLE288-24DC-UD", desc: "288W 24VDC 0-10V & TRIAC Driver", sales: 119440.66 },
  { rank: 13, sku: "ALD824-C2", desc: "AL Driver 800 24V Class 2", sales: 111989.41 },
  { rank: 14, sku: "DSC-241-ACIN", desc: "DSC-241-ACIN DYNA DRUM SO QW4 10° GRAY", sales: 101200.00 },
  { rank: 15, sku: "PIL19A-SEN", desc: "PIL19A Gobo Proj Signage Eng", sales: 98970.00 },
  { rank: 16, sku: "XTH-241-DRQN", desc: "Linear XTR H1 Aluminum 4' 10x60 QS", sales: 95760.00 },
  { rank: 17, sku: "START-UP", desc: "Daily Programing And Startup", sales: 95244.93 },
  { rank: 18, sku: "AJBOX1", desc: "Hybrid Cable Junction Box", sales: 93040.62 },
  { rank: 19, sku: "ALD224-C2", desc: "AL Driver 200 24V Class 2", sales: 89841.26 },
  { rank: 20, sku: "XED-LXCV-OPXQ", desc: "Linear One DMX Ext Core 4' RGBW 30x60", sales: 76797.00 },
];

// SALES REP DATA — invoiced sales by default salesperson, Jan–Sep 2025 (prior) vs Jan–Sep 2026 (current).
// Source: "Q3 RESULTS 2026.xlsx", sheet "Q3 2026 INVOICE SUMMARY" (Q1+Q2+Q3 of each year); territories from the
// EAST / CENTRAL / WEST tabs plus the existing Entertainment / Canada / Mexico assignments. "Other" = not on any tab.
const RAW_SALES_REP_DATA = [
  { id: "ALILLU610", name: "Illuminations Inc", salesPrior: 1570693.07, salesCurrent: 1345275.22, territory: "East" },
  { id: "ALPLPS213", name: "PLP So Cal", salesPrior: 399106.62, salesCurrent: 931076.66, territory: "West" },
  { id: "ALCALS901", name: "Clear Advantage Lighting", salesPrior: 139033.49, salesCurrent: 793024.37, territory: "Central" },
  { id: "ALARDD770", name: "Ardd & Winter", salesPrior: 636243.47, salesCurrent: 600302.21, territory: "East" },
  { id: "ALLIGH954", name: "Lighting Dynamics - Florida", salesPrior: 275467.90, salesCurrent: 537284.75, territory: "Central" },
  { id: "ALILLU781", name: "Illuminate (Omnilite)", salesPrior: 348255.50, salesCurrent: 472941.15, territory: "East" },
  { id: "ALPSAL713", name: "Peterson Scharck & Associates", salesPrior: 265099.75, salesCurrent: 465611.84, territory: "West" },
  { id: "ALFRSA305", name: "Freed Sales", salesPrior: 338081.73, salesCurrent: 445992.13, territory: "Entertainment" },
  { id: "ALRITE514", name: "Rite Lites", salesPrior: 348896.15, salesCurrent: 429827.02, territory: "Canada" },
  { id: "ALTEXA817", name: "Texas Lighting", salesPrior: 366914.38, salesCurrent: 411177.40, territory: "West" },
  { id: "ALTHOM804", name: "Thomas Harris & Co", salesPrior: 140064.49, salesCurrent: 325674.17, territory: "East" },
  { id: "ALMERC913", name: "Mercer Zimmerman", salesPrior: 329952.08, salesCurrent: 310179.14, territory: "Central" },
  { id: "ALTAMP813", name: "Tampa Bay Lighting", salesPrior: 176900.03, salesCurrent: 303387.10, territory: "Central" },
  { id: "ALSKYL561", name: "Skyline", salesPrior: 0.00, salesCurrent: 297938.60, territory: "Other" },
  { id: "ALSUNB808", name: "Sunburst Designs", salesPrior: 16772.13, salesCurrent: 287230.58, territory: "West" },
  { id: "ALMLAZ952", name: "Mlazgar Associates", salesPrior: 329678.59, salesCurrent: 280809.29, territory: "Central" },
  { id: "ALTLDL630", name: "The Lighting Digest", salesPrior: 50297.85, salesCurrent: 234371.34, territory: "Central" },
  { id: "ALRIMM840", name: "Rimmer Lighting", salesPrior: 90870.02, salesCurrent: 199105.60, territory: "Mexico" },
  { id: "ALLIGH314", name: "Lighting Associates", salesPrior: 250489.08, salesCurrent: 191970.41, territory: "Central" },
  { id: "ALLEGA512", name: "Legacy Lighting", salesPrior: 59999.93, salesCurrent: 190219.31, territory: "West" },
  { id: "ALLIGH206", name: "The Lighting Group (LGNW)", salesPrior: 428291.29, salesCurrent: 188724.41, territory: "West" },
  { id: "ALCHES301", name: "Chesapeake Lighting", salesPrior: 251682.22, salesCurrent: 183510.35, territory: "East" },
  { id: "ALLIGH852", name: "Lighting Partners of Central Florida", salesPrior: 131707.16, salesCurrent: 175165.24, territory: "Central" },
  { id: "ALMLSE248", name: "Michigan Lighting Sales - East", salesPrior: 91654.99, salesCurrent: 167925.25, territory: "Central" },
  { id: "ALOCSL858", name: "OCS Lighting + Control", salesPrior: 29123.05, salesCurrent: 121197.97, territory: "West" },
  { id: "ALALSI602", name: "Arizona Lighting Sales", salesPrior: 225889.21, salesCurrent: 118352.25, territory: "West" },
  { id: "AL2MLI210", name: "2M Lighting", salesPrior: 89018.23, salesCurrent: 112328.57, territory: "West" },
  { id: "ALLIGH205", name: "Lighting Solutions of Alabama", salesPrior: 163585.48, salesCurrent: 100973.39, territory: "Central" },
  { id: "ALBUIL801", name: "Build 26", salesPrior: 26409.80, salesCurrent: 99477.54, territory: "West" },
  { id: "ALHOSS214", name: "Hossley Lighting & Power", salesPrior: 268122.56, salesCurrent: 79757.69, territory: "Central" },
  { id: "ALCTLI303", name: "CT Lighting & Controls", salesPrior: 24033.54, salesCurrent: 66332.28, territory: "West" },
  { id: "ALFIVE248", name: "Five Lakes Marketing", salesPrior: 53986.77, salesCurrent: 61726.82, territory: "Entertainment" },
  { id: "ALSIXT510", name: "16500 Inc", salesPrior: 36862.75, salesCurrent: 49206.62, territory: "West" },
  { id: "ALTRIP664", name: "Triple C", salesPrior: 0.00, salesCurrent: 43900.61, territory: "Central" },
  { id: "ALPSGI585", name: "Point Source Group", salesPrior: 1160808.15, salesCurrent: 39370.50, territory: "East" },
  { id: "ALLDAI787", name: "LDA Incorporado", salesPrior: 46325.60, salesCurrent: 35014.30, territory: "Central" },
  { id: "ALFRML770", name: "FRM Lighting & Controls", salesPrior: 0.00, salesCurrent: 26903.29, territory: "East" },
  { id: "ALAUDI868", name: "Audio Source", salesPrior: 58603.81, salesCurrent: 20780.76, territory: "Entertainment" },
  { id: "ALRLVA336", name: "R.L. Vanstory", salesPrior: 31653.20, salesCurrent: 14454.75, territory: "East" },
  { id: "ALINTE212", name: "International Lights", salesPrior: 322631.61, salesCurrent: 14403.24, territory: "East" },
  { id: "ALJLOP000", name: "J. Lopez", salesPrior: 33826.11, salesCurrent: 10581.17, territory: "Other" },
  { id: "ALSAJC973", name: "SJ", salesPrior: 11280.35, salesCurrent: 10558.63, territory: "Other" },
  { id: "ALLEES513", name: "Leesman Lighting Sales", salesPrior: 11322.00, salesCurrent: 10175.60, territory: "Central" },
  { id: "ALCMBU317", name: "CM Buck & Associates", salesPrior: 71120.24, salesCurrent: 7480.02, territory: "Central" },
  { id: "ALLDIO330", name: "Lighting Dynamics - Ohio", salesPrior: 50273.31, salesCurrent: 6209.00, territory: "Central" },
  { id: "ALVISU720", name: "Visual Interest", salesPrior: 0.00, salesCurrent: 4144.97, territory: "Other" },
  { id: "ALIDAH208", name: "Idaho Lighting Solutions", salesPrior: 4575.94, salesCurrent: 3590.00, territory: "West" },
  { id: "ALKBST919", name: "K.B. Stephens", salesPrior: 96000.93, salesCurrent: 3437.63, territory: "East" },
  { id: "ALMLSW616", name: "Michigan Lighting Sales - West", salesPrior: 63154.15, salesCurrent: 2508.00, territory: "Central" },
  { id: "ALDESI615", name: "Designlight", salesPrior: 4724.61, salesCurrent: 0.00, territory: "Central" },
  { id: "ALENGI502", name: "Engineered", salesPrior: 4999.42, salesCurrent: 0.00, territory: "Central" },
  { id: "ALLIGH865", name: "Lighting Trends", salesPrior: 70903.43, salesCurrent: 0.00, territory: "Central" },
  { id: "ALRELA323", name: "RLA", salesPrior: 7570.00, salesCurrent: 0.00, territory: "Other" },
  { id: "ALCROW704", name: "Crown", salesPrior: 1897.82, salesCurrent: -1023.00, territory: "East" },
  { id: "ALJAWL888", name: "JAW Lighting", salesPrior: 122703.37, salesCurrent: -19487.00, territory: "Central" },
];

const SALES_REP_DATA = RAW_SALES_REP_DATA
  .map((rep) => {
    const salesPrior = rep.salesPrior ?? 0;
    const salesCurrent = rep.salesCurrent ?? 0;
    const growthAmt = salesCurrent - salesPrior;
    const growthPct = salesPrior > 0 ? (growthAmt / salesPrior) * 100 : null;
    return {
      ...rep,
      salesPrior,
      salesCurrent,
      growthAmt,
      growthPct,
      incentiveRate: rep.incentiveRate ?? null,
      incentivePaid: rep.incentivePaid ?? 0,
    };
  })
  .sort((a, b) => b.salesCurrent - a.salesCurrent);

const REGION_SUMMARY = (() => {
  const base = {
    West: { salesPrior: 0, salesCurrent: 0 },
    Central: { salesPrior: 0, salesCurrent: 0 },
    East: { salesPrior: 0, salesCurrent: 0 },
    Canada: { salesPrior: 0, salesCurrent: 0 },
    Mexico: { salesPrior: 0, salesCurrent: 0 },
    Entertainment: { salesPrior: 0, salesCurrent: 0 },
  };
  SALES_REP_DATA.forEach((rep) => {
    const bucket = base[rep.territory];
    if (bucket) {
      bucket.salesPrior += rep.salesPrior;
      bucket.salesCurrent += rep.salesCurrent;
    }
  });
  return Object.entries(base).map(([territory, vals]) => {
    const growthAmt = vals.salesCurrent - vals.salesPrior;
    const growthPct = vals.salesPrior > 0 ? (growthAmt / vals.salesPrior) * 100 : null;
    return { territory, label: territory, ...vals, growthAmt, growthPct };
  });
})();

const REVENUE_PCT_DELTA = calculatePercentChange(TOTAL_REVENUE_CURRENT, TOTAL_REVENUE_PRIOR);
const REVENUE_DOLLAR_DELTA = TOTAL_REVENUE_CURRENT - TOTAL_REVENUE_PRIOR;
const GROSS_MARGIN_PCT_DELTA = GROSS_MARGIN_CURRENT - GROSS_MARGIN_PRIOR;
const GROSS_PROFIT_DOLLAR_DELTA = GROSS_PROFIT_CURRENT - GROSS_PROFIT_PRIOR;
const EBITDA_PCT_DELTA = calculatePercentChange(EBITDA_CURRENT, EBITDA_PRIOR);
const EBITDA_DOLLAR_DELTA = EBITDA_CURRENT - EBITDA_PRIOR;
const NET_INCOME_PCT_DELTA = calculatePercentChange(NET_INCOME_CURRENT, NET_INCOME_PRIOR);
const NET_INCOME_DOLLAR_DELTA = NET_INCOME_CURRENT - NET_INCOME_PRIOR;

const KPI_CARDS = [
  {
    title: "Total Sales",
    category: "GROSS REVENUE",
    value: formatCompactCurrency(TOTAL_REVENUE_CURRENT),
    subValue: formatDeltaLabel(REVENUE_PCT_DELTA, REVENUE_DOLLAR_DELTA),
    deltaValue: REVENUE_PCT_DELTA,
    icon: DollarSign,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Gross Margin",
    category: "GROSS MARGIN",
    value: `${GROSS_MARGIN_CURRENT.toFixed(1)}%`,
    subValue: formatDeltaLabel(GROSS_MARGIN_PCT_DELTA, GROSS_PROFIT_DOLLAR_DELTA),
    deltaValue: GROSS_MARGIN_PCT_DELTA,
    icon: Activity,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "EBITDA",
    category: "PROFITABILITY (EBITDA)",
    value: formatSignedCompactCurrency(EBITDA_CURRENT),
    subValue: formatDeltaLabel(EBITDA_PCT_DELTA, EBITDA_DOLLAR_DELTA),
    deltaValue: EBITDA_PCT_DELTA,
    icon: TrendingUp,
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    title: "Net Income",
    category: "NET INCOME",
    value: formatSignedCompactCurrency(NET_INCOME_CURRENT),
    subValue: formatDeltaLabel(NET_INCOME_PCT_DELTA, NET_INCOME_DOLLAR_DELTA),
    deltaValue: NET_INCOME_PCT_DELTA,
    icon: PieChart,
    color: "bg-amber-50 text-amber-700",
  }
];

export default function GMDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (!APP_PASSWORD) return true;
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [salesRepSort, setSalesRepSort] = useState({
    key: 'salesCurrent',
    direction: 'desc',
    type: SORT_TYPES.number,
  });
  const [customerSort, setCustomerSort] = useState({
    key: 'value',
    direction: 'desc',
    type: SORT_TYPES.number,
  });
  const [productSort, setProductSort] = useState({
    key: 'sales',
    direction: 'desc',
    type: SORT_TYPES.number,
  });

  const sortData = (data, sortState) => {
    const sorted = [...data];
    const { key, direction, type } = sortState;
    sorted.sort((a, b) => {
      const result = compareValues(a[key], b[key], type);
      return direction === 'asc' ? result : -result;
    });
    return sorted;
  };

  const sortedSalesRepData = useMemo(
    () => sortData(SALES_REP_DATA, salesRepSort),
    [salesRepSort]
  );
  const TOTAL_REVENUE = TOTAL_REVENUE_FY2025; // FY2025 products tab share denominator

  const customersWithShare = useMemo(
    () =>
      TOP_CUSTOMERS_DATA.map((customer) => ({
        ...customer,
        share: (customer.value / CUSTOMER_PERIOD_TOTAL) * 100,
      })),
    []
  );

  const sortedCustomerData = useMemo(
    () => sortData(customersWithShare, customerSort),
    [customersWithShare, customerSort]
  );
  const productsWithShare = useMemo(
    () =>
      TOP_PRODUCTS_DATA.map((product) => ({
        ...product,
        share: (product.sales / TOTAL_REVENUE) * 100,
      })),
    [TOTAL_REVENUE]
  );

  const sortedProductData = useMemo(
    () => sortData(productsWithShare, productSort),
    [productsWithShare, productSort]
  );

  const updateSort = (setter) => (key, type = SORT_TYPES.number) => {
    setter((prev) => {
      if (prev.key === key) {
        return {
          ...prev,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'desc', type };
    });
  };

  const handleSalesRepSort = updateSort(setSalesRepSort);
  const handleCustomerSort = updateSort(setCustomerSort);
  const handleProductSort = updateSort(setProductSort);

  useEffect(() => {
    if (!APP_PASSWORD) {
      setIsAuthenticated(true);
      return;
    }
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
    setIsAuthenticated(stored);
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!APP_PASSWORD || passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ACCESS_STORAGE_KEY, 'true');
      }
      return;
    }
    setAuthError('Incorrect password. Please try again.');
  };

  const SortIndicator = ({ state, column, defaultDirection = 'desc' }) => (
    <span className="text-[10px] text-slate-400">
      {state.key === column ? (state.direction === 'asc' ? '▲' : '▼') : defaultDirection === 'asc' ? '▲' : '▼'}
    </span>
  );

  // Calculations for variance
  const calculateVariance = (current, prior, invertColor) => {
    const diff = current - prior;
    const pct = prior !== 0 ? (diff / Math.abs(prior)) * 100 : 0;
    let isGood = invertColor ? diff < 0 : diff > 0;
    return { diff, pct, isGood };
  };

  const formatValue = (val, type) => {
    if (type === 'percent') return `${val.toFixed(1)}%`;
    const sign = val < 0 ? '-' : '';
    const abs = Math.abs(val);
    if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}k`;
    return `${sign}$${abs.toFixed(0)}`;
  };

const formatCurrencyWhole = (value) => {
  if (value === null || value === undefined) return '—';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatCurrencyFull = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return value < 0 ? `-$${abs}` : `$${abs}`;
};

const formatSignedCurrency = (value) => {
  if (value === null || value === undefined) return '—';
  if (value === 0) return '$0';
  const formatted = `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return value > 0 ? `+${formatted}` : `-${formatted}`;
};

const formatPercentWhole = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `${Math.round(value)}%`;
};

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <img src="/acclaim_logo.svg" alt="Acclaim Lighting" className="h-10 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-slate-900">Metrics Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Enter the access password to continue.</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 p-4 md:p-8">
      
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-center gap-4 mb-6">
          {/* Logo Placeholder (Represents the SVG logo requested) */}
          <div className="flex-shrink-0">
            <img src="/acclaim_logo.svg" alt="Acclaim Lighting" className="h-12" />
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-2">
            <p className="text-slate-900 text-sm font-semibold">{PERIOD_LABEL}</p>
          </div>
        </div>
        
        {/* Full Width Tab Navigation */}
        <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
          <div className="flex w-full">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'overview' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('yoy')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'yoy' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Table className="w-4 h-4" />
              YoY Analysis
            </button>
            <button 
              onClick={() => setActiveTab('salesreps')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'salesreps' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Sales Reps
            </button>
            <button 
              onClick={() => setActiveTab('customers')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'customers' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4" />
              Customers
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'products' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Products
            </button>
          </div>
        </div>
      </header>

      {/* KPI Cards - ONLY ON OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map((kpi, index) => {
            const delta = kpi.deltaValue ?? 0;
            const deltaBadge =
              delta > 0
                ? 'bg-emerald-50 text-emerald-700'
                : delta < 0
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700';
            return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{kpi.category}</span>
                  <div className={`p-2 w-fit rounded-lg ${kpi.color}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
              <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${deltaBadge}`}>
                {kpi.subValue}
              </div>
            </div>
          )})}
        </div>
      )}

      {activeTab === 'overview' ? (
        <>
          {/* OVERVIEW CONTENT - Uniform 2x2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             
             {/* Chart 1: Profitability Turnaround */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Profitability Trend ({PRIOR_LABEL} vs {CURRENT_LABEL})</h3>
              <div className="h-64 sm:h-72 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={HISTORY_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val/1000000}M`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#10B981'}} tickFormatter={(val) => `${val}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value, name, props) => {
                        const key = props?.dataKey;
                        if (key === 'sales' || key === 'ebitda') {
                          return [formatCurrencyFull(value), key === 'sales' ? 'Revenue' : 'EBITDA'];
                        }
                        if (key === 'marginPct') {
                          return [`${value.toFixed(1)}%`, 'Margin %'];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar yAxisId="left" dataKey="ebitda" name="EBITDA" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="marginPct" name="Margin %" stroke="#F59E0B" strokeWidth={3} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: P&L Breakdown (Pie Chart) - CENTERED */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{CURRENT_LABEL} Revenue Allocation</h3>
              <p className="text-xs text-slate-500 mb-4">Where did the {formatCompactCurrency(TOTAL_REVENUE_CURRENT)} go? Spend exceeded revenue by {formatCompactCurrency(Math.abs(NET_INCOME_CURRENT))} (net loss).</p>
              <div className="h-64 sm:h-72 md:h-80 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={REVENUE_PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => {
                        return `${name} (${(percent * 100).toFixed(1)}%)`;
                      }}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    >
                      {REVENUE_PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                  </RePieChart>
                </ResponsiveContainer>
                {/* Center Label - Centered absolutely within the chart container */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Rev</span>
                  <span className="block font-bold text-slate-800 text-sm">{formatCompactCurrency(TOTAL_REVENUE_CURRENT)}</span>
                </div>
              </div>
            </div>

            {/* Chart 3: Labor Efficiency Ratio */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Labor Efficiency Ratio
                  </h3>
                  <p className="text-slate-500 text-sm">Revenue per $1.00 Labor</p>
                </div>
              </div>
              
              <div className="h-64 sm:h-72 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={LABOR_EFFICIENCY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#4F46E5'}} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value, name, props) => {
                        const key = props?.dataKey;
                        if (key === 'labor') {
                          return [formatCurrencyFull(value), 'Total Labor Cost'];
                        }
                        if (key === 'ratio') {
                          return [`${value.toFixed(2)}x`, 'Efficiency Ratio'];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="labor" name="Total Labor Cost" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={50} />
                    <Line yAxisId="right" type="monotone" dataKey="ratio" name="Efficiency Ratio" stroke="#4F46E5" strokeWidth={3} dot={{r: 6, fill: "#4F46E5"}}>
                      <LabelList 
                        dataKey="ratio" 
                        position="top" 
                        offset={10} 
                        formatter={(val) => val.toFixed(2)} 
                        style={{ fill: '#4F46E5', fontSize: '12px', fontWeight: 'bold' }} 
                      />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Cost Structure Efficiency */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-emerald-600" />
                    Cost Efficiency Trends
                  </h3>
                  <p className="text-slate-500 text-sm">Expenses as % of Revenue</p>
                </div>
              </div>
              
              <div className="h-64 sm:h-72 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_EFFICIENCY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${val}%`} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val) => `${val}%`}
                    />
                    <Legend />
                    <Bar dataKey="y2025" name={`${PRIOR_LABEL} %`} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="y2026" name={`${CURRENT_LABEL} %`} fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'yoy' ? (
        <>
          {/* YOY ANALYSIS CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 h-full">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Expense Drivers ({PRIOR_LABEL} vs {CURRENT_LABEL})</h3>
              <div className="h-[320px] sm:h-[400px] lg:h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TOP_EXPENSES_DATA} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val/1000000}M`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 11, fill: '#1e293b'}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val) => `$${val.toLocaleString()}`}
                    />
                    <Legend verticalAlign="top" align="right"/>
                    <Bar dataKey="y2025" name={PRIOR_LABEL} fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="y2026" name={CURRENT_LABEL} fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2 h-full">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-100">
                <h3 className="font-semibold text-slate-900">Detailed Year-Over-Year Variance (Jan–Sep)</h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 w-1/3 bg-slate-50">Line Item</th>
                        <th className="px-6 py-3 text-right bg-slate-50">{PRIOR_LABEL} Actual</th>
                        <th className="px-6 py-3 text-right bg-slate-50">{CURRENT_LABEL} Actual</th>
                        <th className="px-6 py-3 text-right bg-slate-50">Variance ($)</th>
                        <th className="px-6 py-3 text-right bg-slate-50">Variance (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {YOY_DATA.map((section, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="bg-slate-100">
                            <td colSpan={5} className="px-6 py-2 font-bold text-xs text-slate-500 uppercase tracking-wider">{section.category}</td>
                          </tr>
                          {section.items.map((item, itemIdx) => {
                            const variance = calculateVariance(item.y2026, item.y2025, item.invertColor);
                            const isPositive = variance.diff > 0;
                            
                            return (
                              <tr key={`${idx}-${itemIdx}`} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                <td className="px-6 py-4 text-right text-slate-500">
                                  {formatValue(item.y2025, item.format)}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                  {formatValue(item.y2026, item.format)}
                                </td>
                                <td className={`px-6 py-4 text-right font-medium ${variance.isGood ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {isPositive ? '+' : ''}{formatValue(variance.diff, item.format)}
                                </td>
                                <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                    variance.isGood 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : 'bg-red-50 text-red-700'
                                  }`}>
                                    {variance.diff >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {variance.pct.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'customers' ? (
        <>
          {/* TOP CUSTOMERS CONTENT */}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart: Top 20 Revenue Contribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Top 20 Customers ({CUSTOMER_PERIOD_LABEL})</h3>
                  <p className="text-slate-500 text-sm">Ranked by invoiced sales, net of credit memos</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg text-right">
                   <span className="block text-xs text-blue-600 uppercase font-bold tracking-wider">Top 20 Total</span>
                   <span className="block font-bold text-blue-900 text-lg">{formatCompactCurrency(TOP_CUSTOMERS_TOTAL)}</span>
                </div>
              </div>
              <div className="h-[360px] sm:h-[480px] lg:h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={TOP_CUSTOMERS_DATA} 
                    layout="vertical" 
                    margin={{ top: 5, right: 24, left: 20, bottom: 5 }}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val/1000}k`} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={260} 
                      tick={{fontSize: 11, fill: '#1e293b'}} 
                      interval={0}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    />
                    <Bar dataKey="value" name="Revenue" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                       <LabelList 
                          dataKey="value" 
                          position="right" 
                          formatter={(val) => `$${(val/1000).toFixed(0)}k`} 
                          style={{ fontSize: '10px', fill: '#64748b', fontWeight: 600 }}
                        />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-3">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-100">
                <h3 className="font-semibold text-slate-900">Customer Revenue Detail</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 w-12 text-center">Rank</th>
                      <th className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => handleCustomerSort('name', SORT_TYPES.text)}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500"
                        >
                          Customer Name
                          <SortIndicator state={customerSort} column="name" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCustomerSort('value')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 justify-end w-full"
                        >
                          Total Sales ({CUSTOMER_PERIOD_LABEL})
                          <SortIndicator state={customerSort} column="value" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCustomerSort('share')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 justify-end w-full"
                        >
                          % of Q3 Invoiced Sales
                          <SortIndicator state={customerSort} column="share" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedCustomerData.map((customer, idx) => (
                      <tr key={`${customer.name}-${customer.value}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-center font-medium text-slate-400">#{idx + 1}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                        <td className="px-6 py-4 text-right font-mono text-slate-700">
                          ${customer.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-slate-500">{customer.share.toFixed(1)}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${customer.share * 4}%` }} 
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden mt-4 space-y-4">
                {sortedCustomerData.map((customer, idx) => (
                  <div key={`mobile-customer-${customer.name}-${idx}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-semibold">#{idx + 1}</p>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">{CUSTOMER_PERIOD_LABEL}</span>
                    </div>
                    <h4 className="text-base font-semibold text-slate-900">{customer.name}</h4>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Total Sales</p>
                        <p className="font-mono text-slate-900">
                          ${customer.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">% of Q3 Sales</p>
                        <p className="font-semibold text-slate-700">{customer.share.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${customer.share * 4}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'products' ? (
        <>
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>This tab shows full-year 2025 data. To refresh it, run Acumatica's Sales Profitability by Item Class and Item report for Jan 1–Sep 30, 2026 (the Oct 1 export spanned Jan 2025–Oct 2026 in one total).</span>
          </div>
          {/* PRODUCT ANALYSIS CONTENT */}
          
          {/* Row 1: Item Class Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Sales by Item Class</h3>
                  <p className="text-slate-500 text-sm">Revenue vs Margin %</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Sales Volume
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-100">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> Margin %
                  </div>
                </div>
             </div>
             <div className="h-64 sm:h-72 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={PRODUCT_CLASS_DATA} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 11}} 
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val/1000000}M`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#f97316'}} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val, name) => {
                        if (name === "margin") return [`${val}%`, "Margin"];
                        return [`$${val.toLocaleString()}`, "Sales"];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: "#f97316"}} />
                  </ComposedChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Row 2: Top Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900">Top 20 Products (FY2025)</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Ranked by Line Total</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-medium border border-emerald-100">
                   Top Product = 4.7% of Revenue
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 w-12 text-center">Rank</th>
                      <th className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => handleProductSort('sku', SORT_TYPES.text)}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500"
                        >
                          Product SKU
                          <SortIndicator state={productSort} column="sku" />
                        </button>
                      </th>
                      <th className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => handleProductSort('desc', SORT_TYPES.text)}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500"
                        >
                          Description
                          <SortIndicator state={productSort} column="desc" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleProductSort('sales')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 justify-end w-full"
                        >
                          Total Sales
                          <SortIndicator state={productSort} column="sales" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleProductSort('share')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 justify-end w-full"
                        >
                          % Total Sales
                          <SortIndicator state={productSort} column="share" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedProductData.map((prod, idx) => (
                      <tr key={`${prod.sku}-${prod.sales}`} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 text-center font-bold text-slate-400">#{idx + 1}</td>
                         <td className="px-6 py-4 font-mono text-indigo-600 font-medium">{prod.sku}</td>
                         <td className="px-6 py-4 text-slate-600">{prod.desc}</td>
                         <td className="px-6 py-4 text-right font-medium text-slate-900">
                           ${prod.sales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-slate-500">{prod.share.toFixed(1)}%</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full" 
                                  style={{ width: `${prod.share * 15}%` }} // Scale up for visibility
                                ></div>
                              </div>
                            </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
             <div className="md:hidden mt-4 space-y-4">
               {sortedProductData.map((prod, idx) => (
                 <div key={`mobile-product-${prod.sku}-${idx}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                   <div className="flex items-center justify-between mb-2">
                     <p className="text-xs text-slate-400 font-semibold">#{idx + 1}</p>
                     <span className="text-[11px] font-semibold text-slate-500 uppercase">2025</span>
                   </div>
                   <p className="font-mono text-indigo-600 text-sm">{prod.sku}</p>
                   <h4 className="text-base font-semibold text-slate-900">{prod.desc}</h4>
                   <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                     <div>
                       <p className="text-xs text-slate-500 uppercase">Sales</p>
                       <p className="font-mono text-slate-900">
                         ${prod.sales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                       </p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 uppercase">% of Revenue</p>
                       <p className="font-semibold text-slate-700">{prod.share.toFixed(1)}%</p>
                     </div>
                   </div>
                   <div className="mt-3">
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${prod.share * 15}%` }}></div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </>
      ) : activeTab === 'salesreps' ? (
        <>
          {/* SALES REPS CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 h-full">
            {/* Chart: prior vs current YTD performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Sales Rep Performance (Top 20)</h3>
                  <p className="text-slate-500 text-sm">{CURRENT_LABEL} invoiced sales vs {PRIOR_LABEL} with growth %</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div> {PRIOR_LABEL} Sales
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> {CURRENT_LABEL} Sales
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Growth %
                  </div>
                </div>
              </div>
              <div className="h-[320px] sm:h-[400px] lg:h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={SALES_REP_DATA.slice(0, 20)} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      interval={0} 
                      tick={{fontSize: 11, fill: '#64748b'}} 
                      height={80}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 11 } }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(val) => `${Math.round(val)}%`}
                      tick={{ fontSize: 11, fill: '#10B981' }}
                      label={{ value: `Growth % vs ${PRIOR_LABEL}`, angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#10B981', fontSize: 11 } }}
                      domain={['dataMin-10', 'dataMax+10']}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val, name, props) => {
                        const key = props?.dataKey;
                        if (key === 'salesPrior' || key === 'salesCurrent') {
                          return [
                            formatCurrencyFull(val),
                            key === 'salesPrior' ? `${PRIOR_LABEL} Sales` : `${CURRENT_LABEL} Sales`
                          ];
                        }
                        if (key === 'growthPct') {
                          return [
                            formatPercentWhole(val),
                            'Growth %'
                          ];
                        }
                        return [val, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="salesPrior" name={`${PRIOR_LABEL} Sales`} fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar yAxisId="left" dataKey="salesCurrent" name={`${CURRENT_LABEL} Sales`} fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="growthPct" name={`Growth % vs ${PRIOR_LABEL}`} stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Region map + rollup */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
              <h4 className="text-base font-semibold text-slate-900 mb-2">Regional Summary</h4>
              <p className="text-sm text-slate-500 mb-4">Totals and YoY growth by territory</p>
              <div
                className="relative rounded-xl border border-slate-200 p-4 overflow-hidden min-h-[260px]"
                style={{
                  backgroundImage: "url('/mapppAsset3.svg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-white/80" />
                <div className="absolute inset-0">
                  {(() => {
                    const positions = {
                      Canada: { top: '18%', left: '64%' },
                      Mexico: { top: '78%', left: '45%' },
                      West: { top: '62%', left: '20%' },
                      Central: { top: '48%', left: '50%' },
                      East: { top: '42%', left: '82%' },
                      Entertainment: { top: '86%', left: '90%' },
                    };
                    return Object.entries(positions).map(([label, pos]) => {
                      const region = REGION_SUMMARY.find((r) => r.label === label);
                      if (!region) return null;
                      const isNa = region.growthPct === null || Number.isNaN(region.growthPct);
                      const badge =
                        isNa ? 'bg-slate-100 text-slate-600' : region.growthPct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';
                      const growthLabel = isNa ? 'N/A' : `${region.growthPct >= 0 ? '+' : ''}${region.growthPct.toFixed(1)}%`;
                      const showGrowthPill = label !== 'Entertainment';
                      return (
                        <div
                          key={label}
                          className="absolute bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-sm w-36"
                          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
                            {showGrowthPill && (
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${badge}`}>{growthLabel}</span>
                            )}
                          </div>
                          <div className="text-base font-bold text-slate-900">{formatCurrencyWhole(region.salesCurrent)}</div>
                          <p className="text-[11px] text-slate-500">{PRIOR_LABEL}: {formatCurrencyWhole(region.salesPrior)}</p>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Sales Rep Table - All Reps */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-3">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-100">
                <h3 className="font-semibold text-slate-900">Sales Rep Detail (All Reps)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 w-12 text-center">Rank</th>
                      <th className="px-6 py-3 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('name', SORT_TYPES.text)}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-start"
                        >
                          Rep Name
                          <SortIndicator state={salesRepSort} column="name" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('salesCurrent')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-end"
                        >
                          {CURRENT_LABEL} Sales
                          <SortIndicator state={salesRepSort} column="salesCurrent" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('salesPrior')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-end"
                        >
                          {PRIOR_LABEL} Sales
                          <SortIndicator state={salesRepSort} column="salesPrior" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('growthAmt')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-end"
                        >
                          Δ Sales
                          <SortIndicator state={salesRepSort} column="growthAmt" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('growthPct')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-end"
                        >
                          Δ %
                          <SortIndicator state={salesRepSort} column="growthPct" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedSalesRepData.map((rep, index) => {
                      const growthPositive = rep.growthAmt >= 0;
                      const isGrowthNa = rep.growthPct === null || Number.isNaN(rep.growthPct);
                      const growthBadge = isGrowthNa
                        ? 'bg-slate-100 text-slate-500'
                        : growthPositive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700';
                      return (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-center font-medium text-slate-400">#{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{rep.name}</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-900">{formatCurrencyWhole(rep.salesCurrent)}</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-600">{formatCurrencyWhole(rep.salesPrior)}</td>
                          <td className={`px-6 py-4 text-right font-mono ${growthPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatSignedCurrency(rep.growthAmt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${growthBadge}`}>
                              {formatPercentWhole(rep.growthPct)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden mt-4 space-y-4">
                {sortedSalesRepData.map((rep, index) => {
                  const isGrowthNa = rep.growthPct === null || Number.isNaN(rep.growthPct);
                  const mobileGrowthBadge = isGrowthNa
                    ? 'bg-slate-100 text-slate-500'
                    : rep.growthPct >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700';
                  return (
                    <div key={`mobile-rep-${rep.name}-${index}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400 font-semibold">#{index + 1}</p>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900">{rep.name}</h4>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500 uppercase">{PRIOR_LABEL} Sales</p>
                          <p className="font-mono text-slate-700">{formatCurrencyWhole(rep.salesPrior)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">{CURRENT_LABEL} Sales</p>
                          <p className="font-mono text-slate-900">{formatCurrencyWhole(rep.salesCurrent)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Δ Sales</p>
                          <p className={`font-mono ${rep.growthAmt >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatSignedCurrency(rep.growthAmt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Δ %</p>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${mobileGrowthBadge}`}>
                            {isGrowthNa ? 'N/A' : formatPercentWhole(rep.growthPct)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
}