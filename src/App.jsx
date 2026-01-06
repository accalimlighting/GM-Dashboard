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

const YOY_DATA = [
  { 
    category: "Revenue & Profit",
    items: [
      { name: "Total Sales", y2024: 15038228.95, y2025: 17096341.07, format: "currency", invertColor: false },
      { name: "Cost of Goods Sold", y2024: 10187029.96, y2025: 10349942.61, format: "currency", invertColor: true },
      { name: "Gross Profit", y2024: 4851198.99, y2025: 6746398.46, format: "currency", invertColor: false },
      { name: "Gross Margin", y2024: 32.3, y2025: 39.5, format: "percent", invertColor: false },
      { name: "EBITDA", y2024: -953185.16, y2025: 635229.78, format: "currency", invertColor: false },
      { name: "EBITDA Margin", y2024: -6.3, y2025: 3.7, format: "percent", invertColor: false },
      { name: "Net Income", y2024: -1138149.23, y2025: 386450.37, format: "currency", invertColor: false },
    ]
  },
  {
    category: "Key Expense Drivers",
    items: [
      { name: "Labor Expenses", y2024: 2089865.44, y2025: 2305718.36, format: "currency", invertColor: true },
      { name: "Commissions", y2024: 1715290.06, y2025: 1609348.25, format: "currency", invertColor: true },
      { name: "Tariffs & Duties", y2024: 2348528.42, y2025: 2776282.99, format: "currency", invertColor: true },
      { name: "Overage Expense", y2024: 740727.26, y2025: 278771.43, format: "currency", invertColor: true },
    ]
  },
  {
    category: "Operational Costs",
    items: [
      { name: "Freight In", y2024: 580305.75, y2025: 492159.34, format: "currency", invertColor: true },
      { name: "Freight Out", y2024: 317068.36, y2025: 325207.36, format: "currency", invertColor: true },
      { name: "Advertising", y2024: 237228.70, y2025: 217048.76, format: "currency", invertColor: true },
      { name: "R&D", y2024: 111337.39, y2025: 82776.94, format: "currency", invertColor: true },
      { name: "Trade Shows", y2024: 107151.52, y2025: 62489.51, format: "currency", invertColor: true },
      { name: "Travel", y2024: 165997.20, y2025: 199147.35, format: "currency", invertColor: true },
    ]
  }
];

const HISTORY_DATA = [
  { month: '2024', sales: 15038228, marginPct: 32.3, ebitda: -953185 },
  { month: '2025', sales: 17096341, marginPct: 39.5, ebitda: 635230 },
];

const TOTAL_REVENUE_2024 = 15038228.95;
const TOTAL_REVENUE_2025 = 17096341.07;
const GROSS_MARGIN_2024 = 32.3;
const GROSS_MARGIN_2025 = 39.5;
const GROSS_PROFIT_2024 = 4851198.99;
const GROSS_PROFIT_2025 = 6746398.46;
const EBITDA_2024 = -953185.16;
const EBITDA_2025 = 635229.78;
const NET_INCOME_2024 = -1138149.23;
const NET_INCOME_2025 = 386450.37;

const ACCESS_STORAGE_KEY = 'acclaim-dashboard-access';
const APP_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || '';

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

// --- UPDATED CHART DATA ---

// 1. REVENUE ALLOCATION PIE
const REVENUE_PIE_DATA = [
  { name: 'COGS', value: 10349942.61, color: '#EF4444' }, // Red
  { name: 'Labor', value: 2305718.36, color: '#F59E0B' }, // Orange
  { name: 'Selling', value: 2694976.18, color: '#FCD34D' }, // Yellow
  { name: 'OpEx (Admin + Facility)', value: 1110474.14, color: '#6366F1' }, // Indigo
  { name: 'Net Profit', value: 386450.37, color: '#10B981' }, // Green
  { name: 'Interest/Tax', value: 248779.41, color: '#94A3B8' }, // Gray
];

// 2. COST EFFICIENCY
const COST_EFFICIENCY_DATA = [
  { name: 'COGS', y2024: 67.7, y2025: 60.5 },
  { name: 'Labor', y2024: 13.9, y2025: 13.5 },
  { name: 'Selling', y2024: 18.4, y2025: 15.8 },
  { name: 'Admin/Fac', y2024: 6.3, y2025: 6.5 },
];

const TOP_EXPENSES_DATA = [
  { name: 'Tariffs & Duties', y2024: 2348528.42, y2025: 2776282.99 },
  { name: 'Salaries', y2024: 1587365.57, y2025: 1716621.40 },
  { name: 'Commissions', y2024: 1715290.06, y2025: 1609348.25 },
  { name: 'Freight In', y2024: 580305.75, y2025: 492159.34 },
  { name: 'Temp Help', y2024: 400510.60, y2025: 475601.70 },
];

const LABOR_EFFICIENCY_DATA = [
  { year: '2024', labor: 2089865.44, sales: 15038228.95, ratio: 7.20 },
  { year: '2025', labor: 2305718.36, sales: 17096341.07, ratio: 7.41 },
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

// SALES REP DATA (final 2024/2025; targets not provided)
const RAW_SALES_REP_DATA = [
  { name: "Illuminations (ALILLU610)", sales2024: 383443.18, sales2025: 1703977.50 },
  { name: "PSGI", sales2024: 0, sales2025: 1204452.26 },
  { name: "ARDD & Winter (ALARDD770)", sales2024: 201406.39, sales2025: 897206.96 },
  { name: "RL (ALMLAZ952)", sales2024: 403497.07, sales2025: 498543.28 },
  { name: "Texas Lighting (ALTEXA817)", sales2024: 426362.16, sales2025: 476264.33 },
  { name: "LG Northwest (ALLIGH206)", sales2024: 27964.06, sales2025: 481317.44 },
  { name: "PLP SoCal (ALPLPS213)", sales2024: 261604.05, sales2025: 434709.37 },
  { name: "PSA Lighting (ALPSAL713)", sales2024: 789732.86, sales2025: 462718.31 },
  { name: "Omnilite (ALILLU781)", sales2024: 580931.91, sales2025: 442999.96 },
  { name: "ITL Light (ALINTE212)", sales2024: 654544.46, sales2025: 365679.51 },
  { name: "Arizona Lighting (ALSI602)", sales2024: 913332.72, sales2025: 286516.27 },
  { name: "Chesapeake (ALCHES301)", sales2024: 598764.11, sales2025: 205029.81 },
  { name: "Tampa Bay (ALTAMP813)", sales2024: 632319.78, sales2025: 202567.54 },
  { name: "Clear Advantage", sales2024: 148902.66, sales2025: 145656.44 },
  { name: "The Lighting Digest (ALTLDL630)", sales2024: 261534.16, sales2025: 70213.85 },
  { name: "Build 26", sales2024: 101052.30, sales2025: 64968.62 },
  { name: "CT Lighting (ALCTLI303)", sales2024: 88279.98, sales2025: 79760.25 },
  { name: "Legacy Lighting (ALLEGA512)", sales2024: 36721.67, sales2025: 79272.11 },
  { name: "KB Stephens (ALKBST919)", sales2024: 52297.36, sales2025: 105812.36 },
  { name: "Thomas", sales2024: 45589.07, sales2025: 141582.81 },
  { name: "2M Light (AL2MLI210)", sales2024: 142150.06, sales2025: 140866.39 },
  { name: "16500", sales2024: 72538.35, sales2025: 39234.20 },
  { name: "OCS Light (ALOCSL858)", sales2024: 350176.09, sales2025: 48745.36 },
  { name: "Sunburst (ALSUNB808)", sales2024: 275777.15, sales2025: 45022.63 },
  { name: "MLS West (ALMLSW)", sales2024: 102364.19, sales2025: 76817.14 },
  { name: "RL Vanstory", sales2024: 129956.89, sales2025: 31653.20 },
  { name: "Crown", sales2024: 53421.00, sales2025: 1897.82 },
  { name: "FRM Lighting", sales2024: 0, sales2025: 1672.92 },
  { name: "Idaho", sales2024: 5505.04, sales2025: 4575.94 },
  { name: "Hawaii", sales2024: 0, sales2025: 0 },
  { name: "NWLC (ALNWLC503)", sales2024: 14304.81, sales2025: 0 },
].filter((rep) => rep.sales2025 > 0).map((rep) => ({ ...rep, target: null, targetHit: false, incentiveRate: null, incentivePaid: 0 }));

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
    value: formatCompactCurrency(TOTAL_REVENUE_2025),
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
    value: formatCompactCurrency(EBITDA_2025),
    subValue: formatDeltaLabel(EBITDA_PCT_DELTA, EBITDA_DOLLAR_DELTA),
    icon: TrendingUp,
    color: "bg-indigo-50 text-indigo-700",
    status: "Turnaround",
    statusColor: "bg-green-100 text-green-800"
  },
  {
    title: "Net Income",
    category: "NET INCOME",
    value: formatCompactCurrency(NET_INCOME_2025),
    subValue: formatDeltaLabel(NET_INCOME_PCT_DELTA, NET_INCOME_DOLLAR_DELTA),
    icon: PieChart,
    color: "bg-amber-50 text-amber-700",
    status: "Positive",
    statusColor: "bg-green-100 text-green-800"
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
    key: 'sales2025',
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
  const TOTAL_REVENUE = TOTAL_REVENUE_2025;

  const customersWithShare = useMemo(
    () =>
      TOP_CUSTOMERS_DATA.map((customer) => ({
        ...customer,
        share: (customer.value / TOTAL_REVENUE) * 100,
      })),
    [TOTAL_REVENUE]
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
              <h3 className="text-lg font-semibold text-slate-900 mb-2">2025 Revenue Allocation</h3>
              <p className="text-xs text-slate-500 mb-4">Where did the $17.1M go?</p>
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
                  <span className="block font-bold text-slate-800 text-sm">$17.1M</span>
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
                    <Bar dataKey="y2024" name="2024" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="y2025" name="2025" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2 h-full">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-100">
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
                          <tr className="bg-slate-100">
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
              <div className="h-[360px] sm:h-[480px] lg:h-[600px] w-full">
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
                          Total Sales (2025)
                          <SortIndicator state={customerSort} column="value" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCustomerSort('share')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 justify-end w-full"
                        >
                          % of Company Total Sales
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
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">2025</span>
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
                        <p className="text-xs text-slate-500 uppercase">% of Company</p>
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
                          onClick={() => handleSalesRepSort('sales2024')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-end"
                        >
                          2024 Sales
                          <SortIndicator state={salesRepSort} column="sales2024" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('sales2025')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-end"
                        >
                          2025 Sales
                          <SortIndicator state={salesRepSort} column="sales2025" />
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
                      <th className="px-6 py-3 text-right bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('target')}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-end"
                        >
                          Target
                          <SortIndicator state={salesRepSort} column="target" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-center bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleSalesRepSort('targetHit', SORT_TYPES.text)}
                          className="flex items-center gap-1 uppercase text-xs font-semibold tracking-wider text-slate-500 w-full justify-center"
                        >
                          Hit Target
                          <SortIndicator state={salesRepSort} column="targetHit" />
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
              <div className="md:hidden mt-4 space-y-4">
                {sortedSalesRepData.map((rep, index) => (
                  <div key={`mobile-rep-${rep.name}-${index}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-semibold">#{index + 1}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${rep.targetHit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {rep.targetHit ? 'Hit Target' : 'Missed Target'}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-slate-900">{rep.name}</h4>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">2024 Sales</p>
                        <p className="font-mono text-slate-700">{formatCurrencyWhole(rep.sales2024)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">2025 Sales</p>
                        <p className="font-mono text-slate-900">{formatCurrencyWhole(rep.sales2025)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Δ Sales</p>
                        <p className={`font-mono ${rep.growthAmt >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatSignedCurrency(rep.growthAmt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Δ %</p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${rep.growthPct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {formatPercentWhole(rep.growthPct)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 uppercase">Target</p>
                      <p className="font-mono text-slate-700">{rep.target ? formatCurrencyWhole(rep.target) : '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
}