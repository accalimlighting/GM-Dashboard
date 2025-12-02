import React, { useState } from 'react';
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

const YOY_DATA = [
  { 
    category: "Revenue & Profit",
    items: [
      { name: "Total Sales", y2024: 15038228.95, y2025: 15918450.52, format: "currency", invertColor: false },
      { name: "Cost of Goods Sold", y2024: 10187029.96, y2025: 9629840.65, format: "currency", invertColor: true },
      { name: "Gross Profit", y2024: 4851198.99, y2025: 6288609.87, format: "currency", invertColor: false },
      { name: "Gross Margin", y2024: 32.3, y2025: 39.5, format: "percent", invertColor: false },
      { name: "EBITDA", y2024: -953185.16, y2025: 1059431.01, format: "currency", invertColor: false },
      { name: "EBITDA Margin", y2024: -6.3, y2025: 6.7, format: "percent", invertColor: false },
      { name: "Net Income", y2024: -1138149.23, y2025: 849241.03, format: "currency", invertColor: false },
    ]
  },
  {
    category: "Key Expense Drivers",
    items: [
      { name: "Labor Expenses", y2024: 2089865.44, y2025: 2089767.76, format: "currency", invertColor: true },
      { name: "Commissions", y2024: 1715290.06, y2025: 1246583.57, format: "currency", invertColor: true },
      { name: "Tariffs & Duties", y2024: 2348528.42, y2025: 2479441.17, format: "currency", invertColor: true },
      { name: "Overage Expense", y2024: 740727.26, y2025: 278771.43, format: "currency", invertColor: true },
    ]
  },
  {
    category: "Operational Costs",
    items: [
      { name: "Freight In", y2024: 580305.75, y2025: 492159.34, format: "currency", invertColor: true },
      { name: "Freight Out", y2024: 317068.36, y2025: 297456.08, format: "currency", invertColor: true },
      { name: "Advertising", y2024: 237228.70, y2025: 215148.76, format: "currency", invertColor: true },
      { name: "R&D", y2024: 111337.39, y2025: 75009.88, format: "currency", invertColor: true },
      { name: "Trade Shows", y2024: 107151.52, y2025: 62489.51, format: "currency", invertColor: true },
      { name: "Travel (Product)", y2024: 165997.20, y2025: 198566.72, format: "currency", invertColor: true },
    ]
  }
];

const HISTORY_DATA = [
  { month: '2024', sales: 15038228, marginPct: 32.3, ebitda: -953185 },
  { month: '2025', sales: 15918450, marginPct: 39.5, ebitda: 1059431 },
];

const TOTAL_REVENUE_2024 = 15038228.95;
const TOTAL_REVENUE_2025 = 15918450.52;
const GROSS_MARGIN_2024 = 32.3;
const GROSS_MARGIN_2025 = 39.5;
const GROSS_PROFIT_2024 = 4851198.99;
const GROSS_PROFIT_2025 = 6288609.87;
const EBITDA_2024 = -953185.16;
const EBITDA_2025 = 1059431.01;
const NET_INCOME_2024 = -1138149.23;
const NET_INCOME_2025 = 849241.03;

const formatCompactCurrency = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(abs / 1000).toFixed(0)}k`;
  return `$${abs.toFixed(0)}`;
};

const calculatePercentChange = (current, prior) => {
  if (prior === 0) return 0;
  return ((current - prior) / Math.abs(prior)) * 100;
};

const formatDeltaLabel = (percentValue, dollarDiff) => {
  const pctText = `${percentValue >= 0 ? '+' : ''}${percentValue.toFixed(1)}%`;
  const diffText = `${dollarDiff >= 0 ? '+' : '-'}${formatCompactCurrency(Math.abs(dollarDiff))}`;
  return `Vs 2024: ${pctText} (${diffText})`;
};

// --- UPDATED CHART DATA ---

// 1. REVENUE ALLOCATION PIE
const REVENUE_PIE_DATA = [
  { name: 'COGS', value: 9629840, color: '#EF4444' }, // Red
  { name: 'Labor', value: 2089767, color: '#F59E0B' }, // Orange
  { name: 'Selling', value: 2280579, color: '#FCD34D' }, // Yellow
  { name: 'OpEx (Admin)', value: 858832, color: '#6366F1' }, // Indigo
  { name: 'Net Profit', value: 849241, color: '#10B981' }, // Green
  { name: 'Interest/Tax', value: 210189, color: '#94A3B8' }, // Gray
];

// 2. COST EFFICIENCY
const COST_EFFICIENCY_DATA = [
  { name: 'COGS', y2024: 67.7, y2025: 60.5 },
  { name: 'Labor', y2024: 13.9, y2025: 13.1 },
  { name: 'Selling', y2024: 18.4, y2025: 14.3 },
  { name: 'Admin/Fac', y2024: 6.3, y2025: 5.4 },
];

const TOP_EXPENSES_DATA = [
  { name: 'Tariffs & Duties', y2024: 2348528, y2025: 2479441 },
  { name: 'Salaries', y2024: 1587365, y2025: 1566973 },
  { name: 'Commissions', y2024: 1715290, y2025: 1246583 },
  { name: 'Freight In', y2024: 580305, y2025: 492159 },
  { name: 'Temp Help', y2024: 400510, y2025: 414893 },
];

const LABOR_EFFICIENCY_DATA = [
  { year: '2024', labor: 2089865, sales: 15038228, ratio: 7.20 },
  { year: '2025', labor: 2089767, sales: 15918450, ratio: 7.62 },
];

// TOP 20 CUSTOMERS
const TOP_CUSTOMERS_DATA = [
  { rank: 1, name: "State Electric Supply", value: 1011702.80 },
  { rank: 2, name: "Joseph Productions", value: 658730.00 },
  { rank: 3, name: "Mayer Electric", value: 446169.45 },
  { rank: 4, name: "Yale Electric (US)", value: 441811.20 },
  { rank: 5, name: "Volt Lites", value: 318802.00 },
  { rank: 6, name: "Border States", value: 212614.96 },
  { rank: 7, name: "Elliott Electric", value: 195831.66 },
  { rank: 8, name: "Wesco Dist (UT)", value: 195708.64 },
  { rank: 9, name: "Anixter Power", value: 168003.18 },
  { rank: 10, name: "Van Meter (Davenport)", value: 167314.00 },
  { rank: 11, name: "Turtle & Hughes", value: 143045.00 },
  { rank: 12, name: "ADJ Xfer", value: 137352.88 },
  { rank: 13, name: "Colonial Electric", value: 132953.25 },
  { rank: 14, name: "McNaughton-McKay", value: 108169.37 },
  { rank: 15, name: "Graybar", value: 107388.08 },
  { rank: 16, name: "CED Chesterfield", value: 104673.00 },
  { rank: 17, name: "Platt.com", value: 101772.95 },
  { rank: 18, name: "Acclaim Lighting BV", value: 99169.46 },
  { rank: 19, name: "Crawford Electric", value: 97072.55 },
  { rank: 20, name: "Regency Lighting", value: 91556.60 },
];

// PRODUCT ANALYSIS DATA (Updated with ALL ACL- Classes)
const PRODUCT_CLASS_DATA = [
  { name: "Flood", sales: 2033180.94, margin: 61.68 },
  { name: "Linear", sales: 1124749.07, margin: 72.54 },
  { name: "Drivers", sales: 537140.19, margin: 67.29 },
  { name: "Accessories", sales: 495469.26, margin: 71.07 },
  { name: "Flex Tape", sales: 473888.54, margin: 81.71 },
  { name: "Flex Tube", sales: 428595.71, margin: 77.54 },
  { name: "Control", sales: 343418.31, margin: 48.32 },
  { name: "Image Proj", sales: 313130.00, margin: 45.03 },
  { name: "Non-Inv", sales: 232200.84, margin: 100.00 },
  { name: "Direct View", sales: 215139.01, margin: 66.98 },
  { name: "Cable/Conn", sales: 138856.27, margin: 65.08 },
  { name: "Downlights", sales: 51859.95, margin: 34.95 },
  { name: "Power", sales: 13498.59, margin: 74.97 },
  { name: "Parts", sales: 7693.00, margin: 62.14 },
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

// SALES REP DATA (aligned with 2024-2025 incentive register)
const RAW_SALES_REP_DATA = [
  { name: "International Lights", sales2024: 560126.79, sales2025: 1729507.28, target: 1000000, targetHit: true, incentiveRate: 0.03, incentivePaid: 51885.22 },
  { name: "Illuminations Inc", sales2024: 388619.22, sales2025: 1633259.70, target: 2400000, targetHit: false, incentiveRate: 0.02, incentivePaid: 32665.19 },
  { name: "Point Source Group Inc", sales2024: 0, sales2025: 1179292.86, target: 500000, targetHit: true, incentiveRate: 0.01, incentivePaid: 11792.93 },
  { name: "Thomas Harris & Assoc", sales2024: 221878.74, sales2025: 1065334.29, target: 1200000, targetHit: false, incentiveRate: 0.02, incentivePaid: 21306.69 },
  { name: "Advantage Lighting Solutions", sales2024: 910542.74, sales2025: 529749.02, target: 400000, targetHit: true, incentiveRate: 0.01, incentivePaid: 5297.49 },
  { name: "MLS East", sales2024: 223644.06, sales2025: 529192.64, target: 500000, targetHit: true, incentiveRate: 0.03, incentivePaid: 15875.78 },
  { name: "The Lighting Group", sales2024: 53871.41, sales2025: 448137.60, target: 350000, targetHit: true, incentiveRate: 0.03, incentivePaid: 13444.13 },
  { name: "PLP SoCal", sales2024: 254908.25, sales2025: 434088.97, target: 400000, targetHit: true, incentiveRate: 0.03, incentivePaid: 13022.67 },
  { name: "Lighting Dynamics", sales2024: 557246.96, sales2025: 433308.23, target: 600000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Lighting Associates", sales2024: 589065.93, sales2025: 302455.96, target: null, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Chesapeake Lighting", sales2024: 606322.99, sales2025: 301199.84, target: 600000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Lighting Partners", sales2024: 996779.78, sales2025: 205259.83, target: 500000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Mercer-Zimmerman", sales2024: 306892.81, sales2025: 355656.80, target: 350000, targetHit: true, incentiveRate: 0.02, incentivePaid: 7113.14 },
  { name: "R.L. Mlazgar", sales2024: 442203.18, sales2025: 461636.26, target: 575000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Peterson Scharck & Associates", sales2024: 779612.72, sales2025: 571302.85, target: 400000, targetHit: true, incentiveRate: 0.01, incentivePaid: 5713.03 },
  { name: "Texas Lighting Sales", sales2024: 469841.58, sales2025: 497371.67, target: 500000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Tampa Bay Lighting", sales2024: 454043.26, sales2025: 436043.44, target: 700000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Ardd & Winter", sales2024: 240711.99, sales2025: 840472.72, target: 800000, targetHit: true, incentiveRate: 0.03, incentivePaid: 25214.18 },
  { name: "Lighting Dynamics Ohio", sales2024: 122913.11, sales2025: 87414.69, target: 30000, targetHit: true, incentiveRate: 0.01, incentivePaid: 874.15 },
  { name: "JAW Lighting", sales2024: 0, sales2025: 83652.47, target: 250000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Hossley Lighting", sales2024: 74104.08, sales2025: 171686.47, target: 300000, targetHit: false, incentiveRate: 0.02, incentivePaid: 3433.73 },
  { name: "Build 26", sales2024: 28393.56, sales2025: 142214.37, target: 150000, targetHit: false, incentiveRate: 0.02, incentivePaid: 2844.29 },
  { name: "RL Vanstory", sales2024: 47030.00, sales2025: 118573.19, target: 300000, targetHit: false, incentiveRate: 0.02, incentivePaid: 2371.46 },
  { name: "Crown Lighting Group", sales2024: 52560.00, sales2025: 83691.82, target: 300000, targetHit: false, incentiveRate: 0.02, incentivePaid: 1673.84 },
  { name: "KB Stephens", sales2024: 100723.48, sales2025: 120749.35, target: 300000, targetHit: false, incentiveRate: 0.015, incentivePaid: 1811.24 },
  { name: "2M Lighting", sales2024: 167134.65, sales2025: 157349.70, target: 225000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "CT Lighting Sales", sales2024: 90073.83, sales2025: 96512.07, target: 250000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "OCS Lighting & Control", sales2024: 338539.30, sales2025: 114015.34, target: 300000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Idaho Lighting", sales2024: 129640.94, sales2025: 10423.69, target: 100000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Legacy Lighting", sales2024: 41294.18, sales2025: 11675.74, target: 150000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "Sunburst Designs", sales2024: 275479.00, sales2025: 27344.98, target: 275000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
  { name: "The Lighting Digest", sales2024: 325038.76, sales2025: 65369.42, target: 400000, targetHit: false, incentiveRate: null, incentivePaid: 0 },
];

const SALES_REP_DATA = RAW_SALES_REP_DATA
  .map((rep) => {
    const sales2024 = rep.sales2024 ?? 0;
    const sales2025 = rep.sales2025 ?? 0;
    const growthAmt = sales2025 - sales2024;
    const growthPct = sales2024 > 0 ? (growthAmt / sales2024) * 100 : null;
    return {
      ...rep,
      sales2024,
      sales2025,
      growthAmt,
      growthPct,
      incentiveRate: rep.incentiveRate ?? null,
      incentivePaid: rep.incentivePaid ?? 0,
    };
  })
  .sort((a, b) => b.sales2025 - a.sales2025);

const REVENUE_PCT_DELTA = calculatePercentChange(TOTAL_REVENUE_2025, TOTAL_REVENUE_2024);
const REVENUE_DOLLAR_DELTA = TOTAL_REVENUE_2025 - TOTAL_REVENUE_2024;
const GROSS_MARGIN_PCT_DELTA = GROSS_MARGIN_2025 - GROSS_MARGIN_2024;
const GROSS_PROFIT_DOLLAR_DELTA = GROSS_PROFIT_2025 - GROSS_PROFIT_2024;
const EBITDA_PCT_DELTA = calculatePercentChange(EBITDA_2025, EBITDA_2024);
const EBITDA_DOLLAR_DELTA = EBITDA_2025 - EBITDA_2024;
const NET_INCOME_PCT_DELTA = calculatePercentChange(NET_INCOME_2025, NET_INCOME_2024);
const NET_INCOME_DOLLAR_DELTA = NET_INCOME_2025 - NET_INCOME_2024;

const KPI_CARDS = [
  {
    title: "Total Sales",
    category: "GROSS REVENUE",
    value: `$15.92M`,
    subValue: formatDeltaLabel(REVENUE_PCT_DELTA, REVENUE_DOLLAR_DELTA),
    icon: DollarSign,
    color: "bg-blue-50 text-blue-700",
    status: "Growth",
    statusColor: "bg-green-100 text-green-800"
  },
  {
    title: "Gross Margin",
    category: "GROSS MARGIN",
    value: `39.5%`,
    subValue: formatDeltaLabel(GROSS_MARGIN_PCT_DELTA, GROSS_PROFIT_DOLLAR_DELTA),
    icon: Activity,
    color: "bg-emerald-50 text-emerald-700",
    status: "Strong",
    statusColor: "bg-green-100 text-green-800"
  },
  {
    title: "EBITDA",
    category: "PROFITABILITY (EBITDA)",
    value: `$1.06M`,
    subValue: formatDeltaLabel(EBITDA_PCT_DELTA, EBITDA_DOLLAR_DELTA),
    icon: TrendingUp,
    color: "bg-indigo-50 text-indigo-700",
    status: "Turnaround",
    statusColor: "bg-green-100 text-green-800"
  },
  {
    title: "Net Income",
    category: "NET INCOME",
    value: `$849k`,
    subValue: formatDeltaLabel(NET_INCOME_PCT_DELTA, NET_INCOME_DOLLAR_DELTA),
    icon: PieChart,
    color: "bg-amber-50 text-amber-700",
    status: "Positive",
    statusColor: "bg-green-100 text-green-800"
  }
];

export default function GMDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); 

  // Calculations for variance
  const calculateVariance = (current, prior, invertColor) => {
    const diff = current - prior;
    const pct = prior !== 0 ? (diff / Math.abs(prior)) * 100 : 0;
    let isGood = invertColor ? diff < 0 : diff > 0;
    return { diff, pct, isGood };
  };

  const formatValue = (val, type) => {
    if (type === 'percent') return `${val.toFixed(1)}%`;
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
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

  // Total Revenue for Share Calc
  const TOTAL_REVENUE = TOTAL_REVENUE_2025;

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
            <p className="text-slate-900 text-sm font-semibold">Fiscal Year 2025</p>
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
          {KPI_CARDS.map((kpi, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{kpi.category}</span>
                  <div className={`p-2 w-fit rounded-lg ${kpi.color}`}>
                    <kpi.icon className="w-5 h-5" />
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${kpi.statusColor}`}>
                  {kpi.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-slate-500 font-medium">{kpi.subValue}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'overview' ? (
        <>
          {/* OVERVIEW CONTENT - Uniform 2x2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             
             {/* Chart 1: Profitability Turnaround */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Profitability Turnaround (2024 vs 2025)</h3>
              <div className="h-80 w-full">
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
              <h3 className="text-lg font-semibold text-slate-900 mb-2">2025 Revenue Allocation</h3>
              <p className="text-xs text-slate-500 mb-4">Where did the $15.9M go?</p>
              <div className="h-80 w-full relative">
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
                  <span className="block font-bold text-slate-800 text-sm">$15.9M</span>
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
              
              <div className="h-80 w-full">
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
              
              <div className="h-80 w-full">
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
                    <Bar dataKey="y2024" name="2024 %" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="y2025" name="2025 %" fill="#10B981" radius={[4, 4, 0, 0]} />
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Expense Drivers (2024 vs 2025)</h3>
              <div className="h-[500px] w-full">
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
                    <Bar dataKey="y2024" name="2024" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="y2025" name="2025" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2 h-full">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900">Detailed Year-Over-Year Variance</h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 w-1/3 bg-slate-50">Line Item</th>
                        <th className="px-6 py-3 text-right bg-slate-50">2024 Actual</th>
                        <th className="px-6 py-3 text-right bg-slate-50">2025 Actual</th>
                        <th className="px-6 py-3 text-right bg-slate-50">Variance ($)</th>
                        <th className="px-6 py-3 text-right bg-slate-50">Variance (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {YOY_DATA.map((section, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="bg-slate-50/50">
                            <td colSpan={5} className="px-6 py-2 font-bold text-xs text-slate-500 uppercase tracking-wider">{section.category}</td>
                          </tr>
                          {section.items.map((item, itemIdx) => {
                            const variance = calculateVariance(item.y2025, item.y2024, item.invertColor);
                            const isPositive = variance.diff > 0;
                            
                            return (
                              <tr key={`${idx}-${itemIdx}`} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                <td className="px-6 py-4 text-right text-slate-500">
                                  {formatValue(item.y2024, item.format)}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                  {formatValue(item.y2025, item.format)}
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
                                    {variance.isGood ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
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
                  <h3 className="text-lg font-semibold text-slate-900">Top 20 Customers (2025)</h3>
                  <p className="text-slate-500 text-sm">Ranked by Total Revenue Contribution</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg text-right">
                   <span className="block text-xs text-blue-600 uppercase font-bold tracking-wider">Top 20 Total</span>
                   <span className="block font-bold text-blue-900 text-lg">$5.1M</span>
                </div>
              </div>
              <div className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={TOP_CUSTOMERS_DATA} 
                    layout="vertical" 
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val/1000}k`} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={140} 
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
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900">Customer Revenue Detail</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 w-12 text-center">Rank</th>
                      <th className="px-6 py-3">Customer Name</th>
                      <th className="px-6 py-3 text-right">Total Sales (2025)</th>
                      <th className="px-6 py-3 text-right">% of Company Total Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TOP_CUSTOMERS_DATA.map((customer) => {
                      const share = (customer.value / TOTAL_REVENUE) * 100;
                      
                      return (
                        <tr key={customer.rank} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-center font-medium text-slate-400">#{customer.rank}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-700">
                            ${customer.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-slate-500">{share.toFixed(1)}%</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full" 
                                  style={{ width: `${share * 4}%` }} 
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'products' ? (
        <>
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
             <div className="h-80 w-full">
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
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900">Top 20 Products (YTD)</h3>
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
                      <th className="px-6 py-3">Product SKU</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3 text-right">Total Sales</th>
                      <th className="px-6 py-3 text-right">% Total Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TOP_PRODUCTS_DATA.map((prod) => {
                      const share = (prod.sales / TOTAL_REVENUE) * 100;
                      return (
                        <tr key={prod.rank} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 text-center font-bold text-slate-400">#{prod.rank}</td>
                           <td className="px-6 py-4 font-mono text-indigo-600 font-medium">{prod.sku}</td>
                           <td className="px-6 py-4 text-slate-600">{prod.desc}</td>
                           <td className="px-6 py-4 text-right font-medium text-slate-900">
                             ${prod.sales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-slate-500">{share.toFixed(1)}%</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 rounded-full" 
                                    style={{ width: `${share * 15}%` }} // Scale up for visibility
                                  ></div>
                                </div>
                              </div>
                           </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        </>
      ) : activeTab === 'salesreps' ? (
        <>
          {/* SALES REPS CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 h-full">
            {/* Chart: 2024 vs 2025 performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Sales Rep Performance (Top 20)</h3>
                  <p className="text-slate-500 text-sm">2025 actuals vs 2024 baseline with growth %</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div> 2024 Sales
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> 2025 Sales
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Growth %
                  </div>
                </div>
              </div>
              <div className="h-[500px] w-full">
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
                      label={{ value: 'Growth % vs 2024', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#10B981', fontSize: 11 } }}
                      domain={['dataMin-10', 'dataMax+10']}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val, name, props) => {
                        const key = props?.dataKey;
                        if (key === 'sales2024' || key === 'sales2025') {
                          return [
                            formatCurrencyFull(val),
                            key === 'sales2024' ? '2024 Sales' : '2025 Sales'
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
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales2024" name="2024 Sales" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar yAxisId="left" dataKey="sales2025" name="2025 Sales" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="growthPct" name="Growth % vs 2024" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Rep Table - All Reps */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-3">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-900">Sales Rep Detail (All Reps)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 w-12 text-center">Rank</th>
                      <th className="px-6 py-3 bg-slate-50">Rep Name</th>
                      <th className="px-6 py-3 text-right bg-slate-50">2024 Sales</th>
                      <th className="px-6 py-3 text-right bg-slate-50">2025 Sales</th>
                      <th className="px-6 py-3 text-right bg-slate-50">Δ Sales</th>
                      <th className="px-6 py-3 text-right bg-slate-50">Δ %</th>
                      <th className="px-6 py-3 text-right bg-slate-50">Target</th>
                      <th className="px-6 py-3 text-center bg-slate-50">Hit Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {SALES_REP_DATA.map((rep, index) => {
                      const growthPositive = rep.growthAmt >= 0;
                      const isGrowthNa = rep.growthPct === null || Number.isNaN(rep.growthPct);
                      const growthBadge = isGrowthNa
                        ? 'bg-slate-100 text-slate-500'
                        : growthPositive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700';
                      const targetBadge = rep.targetHit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
                      return (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-center font-medium text-slate-400">#{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{rep.name}</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-600">{formatCurrencyWhole(rep.sales2024)}</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-900">{formatCurrencyWhole(rep.sales2025)}</td>
                          <td className={`px-6 py-4 text-right font-mono ${growthPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatSignedCurrency(rep.growthAmt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${growthBadge}`}>
                              {formatPercentWhole(rep.growthPct)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-slate-600">
                            {rep.target ? formatCurrencyWhole(rep.target) : '—'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${targetBadge}`}>
                              {rep.targetHit ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
}