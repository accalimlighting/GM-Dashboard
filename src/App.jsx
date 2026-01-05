import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  PieChart, 
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Table,
  Users,
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

const TOTAL_SALES_2024 = 15038228.95;
const TOTAL_SALES_2025 = 17096341.07;
const YOY_DATA = [
  { 
    category: "Revenue & Profit",
    items: [
      { name: "Total Sales", y2024: TOTAL_SALES_2024, y2025: TOTAL_SALES_2025, format: "currency", invertColor: false },
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
      { name: "Travel (Product)", y2024: 165997.20, y2025: 199147.35, format: "currency", invertColor: true },
    ]
  }
];

const HISTORY_DATA = [
  { month: '2024', sales: TOTAL_SALES_2024, marginPct: 32.3, ebitda: -953185 },
  { month: '2025', sales: TOTAL_SALES_2025, marginPct: 39.5, ebitda: 635230 },
];

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
  { year: '2024', labor: 2089865, sales: 15038228, ratio: 7.20 },
  { year: '2025', labor: 2305718, sales: 17096341, ratio: 7.41 },
];

// SALES REP YOY DATA (from 2024 vs 2025 report)
const SALES_REP_YOY = [
  { name: "Illuminations (ALILLU610)", territory: "USA East", y2024: 383443.18, y2025: 1703977.50 },
  { name: "PSGI", territory: "USA East", y2024: 0, y2025: 1204452.26 },
  { name: "ARDD & Winter (ALARDD770)", territory: "USA East", y2024: 201406.39, y2025: 897206.96 },
  { name: "RL (ALMLAZ952)", territory: "USA Central", y2024: 403497.07, y2025: 498543.28 },
  { name: "Texas Lighting (ALTEXA817)", territory: "USA West", y2024: 426362.16, y2025: 476264.33 },
  { name: "LG Northwest (ALLIGH206)", territory: "USA West", y2024: 27964.06, y2025: 481317.44 },
  { name: "PLP SoCal (ALPLPS213)", territory: "USA West", y2024: 261604.05, y2025: 434709.37 },
  { name: "PSA Lighting (ALPSAL713)", territory: "USA West", y2024: 789732.86, y2025: 462718.31 },
  { name: "Omnilite (ALILLU781)", territory: "USA East", y2024: 580931.91, y2025: 442999.96 },
  { name: "ITL Light (ALINTE212)", territory: "USA East", y2024: 654544.46, y2025: 365679.51 },
  { name: "Arizona Lighting (ALSI602)", territory: "USA West", y2024: 913332.72, y2025: 286516.27 },
  { name: "Chesapeake (ALCHES301)", territory: "USA East", y2024: 598764.11, y2025: 205029.81 },
  { name: "Tampa Bay (ALTAMP813)", territory: "USA Central", y2024: 632319.78, y2025: 202567.54 },
  { name: "Clear Advantage", territory: "USA Central", y2024: 148902.66, y2025: 145656.44 },
  { name: "The Lighting Digest (ALTLDL630)", territory: "USA Central", y2024: 261534.16, y2025: 70213.85 },
  { name: "Build 26", territory: "USA West", y2024: 101052.30, y2025: 64968.62 },
  { name: "CT Lighting (ALCTLI303)", territory: "USA West", y2024: 88279.98, y2025: 79760.25 },
  { name: "Legacy Lighting (ALLEGA512)", territory: "USA West", y2024: 36721.67, y2025: 79272.11 },
  { name: "KB Stephens (ALKBST919)", territory: "USA East", y2024: 52297.36, y2025: 105812.36 },
  { name: "Thomas", territory: "USA East", y2024: 45589.07, y2025: 141582.81 },
  { name: "2M Light (AL2MLI210)", territory: "USA West", y2024: 142150.06, y2025: 140866.39 },
  { name: "16500", territory: "USA West", y2024: 72538.35, y2025: 39234.20 },
  { name: "OCS Light (ALOCSL858)", territory: "USA West", y2024: 350176.09, y2025: 48745.36 },
  { name: "Sunburst (ALSUNB808)", territory: "USA West", y2024: 275777.15, y2025: 45022.63 },
  { name: "MLS West (ALMLSW)", territory: "USA Central", y2024: 102364.19, y2025: 76817.14 },
  { name: "RL Vanstory", territory: "USA East", y2024: 129956.89, y2025: 31653.20 },
  { name: "Crown", territory: "USA East", y2024: 53421.00, y2025: 1897.82 },
  { name: "FRM Lighting", territory: "USA East", y2024: 0, y2025: 1672.92 },
  { name: "Idaho", territory: "USA West", y2024: 5505.04, y2025: 4575.94 },
  { name: "NWLC (ALNWLC503)", territory: "USA West", y2024: 14304.81, y2025: 0 },
  { name: "Hawaii", territory: "USA West", y2024: 0, y2025: 0 },
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

  const formatDelta = (val, type) => {
    if (val === 0) return type === 'percent' ? '0.0%' : '$0';
    const sign = val > 0 ? '+' : '-';
    const absVal = Math.abs(val);
    if (type === 'percent') return `${sign}${absVal.toFixed(1)}%`;
    return `${sign}${formatValue(absVal, 'currency')}`;
  };

  const repRows = SALES_REP_YOY.map((rep) => {
    const yoy = rep.y2025 - rep.y2024;
    const yoyPct = rep.y2024 === 0 ? 100 : (yoy / rep.y2024) * 100;
    return { ...rep, yoy, yoyPct };
  }).sort((a, b) => b.y2025 - a.y2025);

  const topRepData = repRows.slice(0, 15);

  const kpiCards = [
    {
      title: "GROSS REVENUE",
      category: "Revenue",
      value: formatValue(TOTAL_SALES_2025, "currency"),
      subValue: `Vs 2024: ${formatDelta(TOTAL_SALES_2025 - TOTAL_SALES_2024, 'currency')}`,
      icon: DollarSign,
      color: "bg-blue-50 text-blue-700",
      status: "Growth",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      title: "GROSS MARGIN",
      category: "Efficiency",
      value: `39.5%`,
      subValue: `Vs 2024: ${formatDelta(39.5 - 32.3, 'percent')}`,
      icon: Activity,
      color: "bg-emerald-50 text-emerald-700",
      status: "Strong",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      title: "PROFITABILITY (EBITDA)",
      category: "Profitability",
      value: formatValue(635229.78, "currency"),
      subValue: `Vs 2024: ${formatDelta(635229.78 - (-953185.16), "currency")}`,
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-700",
      status: "Turnaround",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      title: "NET INCOME",
      category: "Bottom Line",
      value: formatValue(386450.37, "currency"),
      subValue: `Vs 2024: ${formatDelta(386450.37 - (-1138149.23), "currency")}`,
      icon: PieChart,
      color: "bg-amber-50 text-amber-700",
      status: "Positive",
      statusColor: "bg-green-100 text-green-800"
    }
  ];

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
            <p className="text-slate-500 text-sm text-right">
               <span className="block font-semibold text-slate-900">Fiscal Year 2025 (Final)</span>
               <span className="block text-xs">General Manager View</span>
            </p>
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
          </div>
        </div>
      </header>

      {/* KPI Cards - ONLY ON OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((kpi, index) => (
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
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={LABOR_EFFICIENCY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#4F46E5'}} domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
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
            {/* Chart: YoY Sales by Rep (Top 15 by 2025 sales) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Sales Rep YoY (Top 15)</h3>
                  <p className="text-slate-500 text-sm">2024 vs 2025 totals with YoY%</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-slate-50 text-slate-700 rounded-full border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div> 2024 Sales
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> 2025 Sales
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> YoY %
                  </div>
                </div>
              </div>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart 
                    data={topRepData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
                      tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} 
                      tick={{fontSize: 11, fill: '#64748b'}} 
                      label={{ value: 'Total Sales', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 11 } }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tickFormatter={(val) => `${val.toFixed(0)}%`} 
                      domain={[-100, 400]}
                      tick={{fontSize: 11, fill: '#10B981'}} 
                      label={{ value: 'YoY %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#10B981', fontSize: 11 } }}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val, name) => {
                        if (name === 'yoyPct') return [`${val.toFixed(1)}%`, 'YoY %'];
                        return [`$${val.toLocaleString()}`, name === 'y2025' ? '2025 Sales' : '2024 Sales'];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="y2024" name="2024 Sales" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={26} />
                    <Bar yAxisId="left" dataKey="y2025" name="2025 Sales" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={26} />
                    <Line yAxisId="right" type="monotone" dataKey="yoyPct" name="YoY %" stroke="#10B981" strokeWidth={2} dot={{r: 3, fill: "#10B981"}} />
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
                      <th className="px-6 py-3 bg-slate-50">Territory</th>
                      <th className="px-6 py-3 text-right bg-slate-50">2024 Sales</th>
                      <th className="px-6 py-3 text-right bg-slate-50">2025 Sales</th>
                      <th className="px-6 py-3 text-right bg-slate-50">YoY ($)</th>
                      <th className="px-6 py-3 text-right bg-slate-50">YoY (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {repRows.map((rep, index) => {
                      const isPositive = rep.yoy >= 0;
                      return (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-center font-medium text-slate-400">#{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{rep.name}</td>
                          <td className="px-6 py-4 text-slate-600">{rep.territory}</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-700">
                            ${rep.y2024.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-slate-700">
                            ${rep.y2025.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                          <td className={`px-6 py-4 text-right font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatValue(rep.yoy, 'currency')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {rep.yoyPct.toFixed(1)}%
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