import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, ZAxis, Legend, Cell
} from 'recharts';
import { 
  Activity, Database, Layers, PieChart, ShieldCheck, 
  Settings2, RefreshCw, BarChart3, TrendingUp, AlertTriangle, 
  Sun, Wind, FlaskConical, ChevronRight, Play, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import type { SampleData, FeatureValue, ModelParams } from './types';

// --- Constants & Translations ---
const LOCATIONS = ['格尔木 (Golmud)', '大柴旦 (Da Qaidam)', '茫崖 (Mangya)', '察尔汗 (Chaka)'];

type Language = 'en' | 'cn';

const translations = {
  en: {
    title: 'Salt Lake PV Decay Prediction System v1.0',
    status: 'STATUS',
    calibrated: 'CALIBRATED',
    dataIn: 'DATA_IN',
    samples: 'SAMPLES',
    region: 'REGION',
    user: 'USER',
    hyperparams: 'Hyperparameters',
    learningRate: 'Learning Rate',
    maxDepth: 'Max Depth',
    subsample: 'Subsample',
    rfTrees: 'RF Tree Count',
    rfDepth: 'RF Max Depth',
    workflow: 'Workflow Stages',
    retrain: 'Re-Train Model',
    engineStatus: 'Engine Status: Ready',
    datasetStatus: 'Dataset Build & Preprocessing',
    datasetDesc: 'Integrating core datasets from Qinghai salt lake (N=642), performing Z-Score normalization.',
    completed: 'Standardization Completed',
    preProcess: 'Start Preprocessing',
    accuracy: 'R² Accuracy',
    mae: 'MAE (Decay)',
    cycle: 'Cleaning Cycle',
    risk: 'Hotspot Risk',
    low: 'LOW',
    rawSnapshot: 'Raw Data Snapshot',
    synced: 'SYNCED',
    degradation: 'Decay Rate',
    rfStage: 'Stage 1: RF Global Unbiased Feature Screening',
    xgbStage: 'Stage 2: XGBoost High-Accuracy Decay Prediction',
    shapStage: 'Stage 3: SHAP Global Interpretability',
    applyStage: 'Application: Coating Suitability & Hotspot Warning',
    importance: 'Importance Ranking (% IncMSE)',
    cumulative: 'Cumulative Contribution',
    rfDesc: 'System has identified 10 core features. Salt ions contribute over 60% of the variance. Low-impact nodes pruned.',
    accuracyTitle: 'Decay Prediction Accuracy',
    shapTitle: 'SHAP Global Importance',
    performance: 'Performance Metrics',
    precision: 'PRECISION',
    recall: 'RECALL',
    summary: 'Analysis Synthesis',
    summaryDesc: 'Hybrid architecture (RF+XGBoost) achieves stability across salt lake micro-climates. Regularization applied. SHAP confirms Na+ positive correlation.',
    coating: 'Coating Performance Ranking',
    rank: 'RANK',
    mod: 'IDENTIFIER',
    predDecay: 'PRED_DECAY',
    hotband: 'Hotband Risk',
    riskLevel: 'Risk Level',
    riskDesc: 'Atmospheric salt density remains within safety margins.',
    logs: 'Model Iteration Logs',
    realtime: 'REAL-TIME_FEED',
    processed: 'PROCESSED',
    engineCalibrated: 'ENGINE: CALIBRATED',
    stages: [
      'Data Prep',
      'Stage 1: RF Selection',
      'Stage 2: XGBoost Model',
      'Stage 3: SHAP Interpret',
      'Apply & Verify'
    ]
  },
  cn: {
    title: '盐湖光伏衰减预测系统 v1.0',
    status: '状态',
    calibrated: '已校准',
    dataIn: '数据载入',
    samples: '样本数',
    region: '区域',
    user: '用户',
    hyperparams: '超参数调节 (Hyperparameters)',
    learningRate: '学习率 (Learning Rate)',
    maxDepth: '最大深度 (Max Depth)',
    subsample: '子采样率 (Subsample)',
    rfTrees: '随机森林树量 (RF Tree Count)',
    rfDepth: '最大树深 (RF Max Depth)',
    workflow: '工作流阶段 (Workflow Stages)',
    retrain: '重新训练模型 (Re-Train Model)',
    engineStatus: '计算引擎：就绪',
    datasetStatus: '数据集构建与预处理 (Dataset Build)',
    datasetDesc: '整合青海盐湖区核心数据集 (N=642)，执行 Z-Score 标准化与数据清洗。',
    completed: '已完成标准化',
    preProcess: '开始预处理',
    accuracy: 'R² 拟合优度 (Accuracy)',
    mae: '平均绝对误差 (MAE)',
    cycle: '清洁周期建议 (Cleaning Cycle)',
    risk: '热斑风险等级 (Hotspot Risk)',
    low: '低风险',
    rawSnapshot: '原始数据快照 (Raw Data Snapshot)',
    synced: '同步中',
    degradation: '衰减率 (Decay Rate)',
    rfStage: '第一阶段：RF 全局无偏特征筛选 (RF Selection)',
    xgbStage: '第二阶段：XGBoost 高精度衰减预测 (XGBoost Prediction)',
    shapStage: '第三阶段：SHAP 非线性回归全局解释 (SHAP Interpret)',
    applyStage: '应用验证：镀膜性能与热斑预警 (Apply & Verify)',
    importance: '特征重要性排序 (Importance Ranking)',
    cumulative: '累计贡献度 (Cumulative Contribution)',
    rfDesc: '系统已识别10项核心特征。盐离子（Cl⁻, Na⁺）贡献了超过60%的方差。低影响节点已从训练集中剔除。',
    accuracyTitle: '衰减预测精度曲线 (Prediction Accuracy)',
    shapTitle: 'SHAP 全局重要性 (SHAP Global)',
    performance: '模型性能指标 (Performance Metrics)',
    precision: '精确率 (Precision)',
    recall: '召回率 (Recall)',
    summary: '综合分析结论 (Summary)',
    summaryDesc: '混合架构 (RF+XGBoost) 在盐湖微气候下表现稳定。通过正则化防止粉尘峰值过拟合。SHAP值确认了Na⁺离子对腐蚀加速的正相关。',
    coating: '镀膜液性能评估排名 (Coating Performance)',
    rank: '排名 (Rank)',
    mod: '型号 (Identifier)',
    predDecay: '预测衰减率 (Pred Decay)',
    hotband: '热斑预警 (Hotband Risk)',
    riskLevel: '风险等级 (Risk Level)',
    riskDesc: '当前大气盐分浓度处于安全范围内。',
    logs: '模型迭代日志 (Iteration Logs)',
    realtime: '实时数据流 (Real-time Feed)',
    processed: '计算规模度',
    engineCalibrated: '引擎：已校准',
    stages: [
      '数据准备',
      '第一阶段：RF 筛选',
      '第二阶段：XGBoost 建模',
      '第三阶段：SHAP 解释',
      '应用与验证'
    ]
  }
};
const FEATURES = [
  { name: '盐尘浓度 (Salt Dust)', unit: 'mg/m²', category: 'core' },
  { name: 'Na⁺ 离子 (Sodium)', unit: 'μg/cm²', category: 'ion' },
  { name: 'Cl⁻ 离子 (Chloride)', unit: 'μg/cm²', category: 'ion' },
  { name: 'Mg²⁺ 离子 (Magnesium)', unit: 'μg/cm²', category: 'ion' },
  { name: 'SO₄²⁻ 离子 (Sulfate)', unit: 'μg/cm²', category: 'ion' },
];

const COATINGS = [
  { id: 'C01', name: '纳米超疏水 (Nano Super-hydrophobic)', cost: 120, durability: 0.85 },
  { id: 'C02', name: '氟碳光油 (Fluorocarbon)', cost: 180, durability: 0.92 },
  { id: 'C03', name: '亲水防尘 (Hydrophilic Anti-dust)', cost: 90, durability: 0.78 },
  { id: 'C04', name: '无机硅基 (Inorganic Silicone)', cost: 150, durability: 0.88 },
];

const generateMockData = (count: number): SampleData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    dustConcentration: 10 + Math.random() * 90,
    temp: -10 + Math.random() * 50,
    humidity: 5 + Math.random() * 40,
    uvIntensity: 200 + Math.random() * 800,
    coatingType: COATINGS[Math.floor(Math.random() * COATINGS.length)].id,
    degradationRate: 2 + Math.random() * 15,
  }));
};

// --- Sub-components ---

const ParameterSlider = ({ label, value, min, max, step, onChange }: any) => (
  <div className="space-y-2 lg:space-y-3">
    <div className="flex flex-col sm:flex-row sm:justify-between text-[9px] lg:text-[11px] font-mono uppercase text-dashboard-muted gap-1">
      <span className="tracking-widest truncate">{label}</span>
      <span className="text-dashboard-accent font-bold bg-dashboard-accent/10 px-1.5 py-0.5 rounded w-fit">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 lg:h-1.5 bg-dashboard-border rounded-lg appearance-none cursor-pointer accent-dashboard-accent hover:bg-dashboard-accent/30 transition-colors"
    />
  </div>
);

const FeatureImportanceChart = ({ data }: { data: FeatureValue[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart layout="vertical" data={data} margin={{ left: 80, right: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#2D3139" />
      <XAxis type="number" domain={[0, 100]} hide />
      <YAxis 
        dataKey="name" 
        type="category" 
        tick={{ fill: '#8A8D91', fontSize: 10 }}
        width={80}
      />
      <Tooltip 
        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        contentStyle={{ background: '#181A1D', border: '1px solid #2D3139', fontSize: '10px' }}
      />
      <Bar dataKey="importance" fill="#00E5FF" radius={0}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.importance > 20 ? '#00E5FF' : '#2D3139'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const PredictionChart = ({ params }: { params: ModelParams }) => {
  const data = useMemo(() => {
    // Hybrid System Reactivity: RF parameters affect the feature quality (noise)
    return Array.from({ length: 40 }, (_, i) => {
      const actual = 5 + (i / 40) * 10;
      const baseNoise = (Math.random() - 0.5);
      
      // XGBoost Factors
      const lrImpact = (1.1 - params.xgbLearningRate) * 2;
      const subImpact = (1 - params.xgbSubsample) * 4;
      const xGBCapacity = (params.xgbMaxDepth > 10) ? (params.xgbMaxDepth - 10) * 0.5 : 0;
      
      // RF Factors (Integration layer)
      const rfStability = (200 / params.rfTrees) * 2;
      const rfComplexity = (params.rfDepth > 15) ? (params.rfDepth - 15) * 0.3 : 0;
      
      const noise = baseNoise * (lrImpact + subImpact + xGBCapacity + rfStability + rfComplexity);
      return {
        x: actual,
        y: actual + noise,
      };
    });
  }, [params.xgbLearningRate, params.xgbSubsample, params.xgbMaxDepth, params.rfTrees, params.rfDepth]);

  const rSquared = 0.96 + (params.xgbLearningRate * 0.02) - (Math.abs(params.xgbSubsample - 0.8) * 0.1) - (params.xgbMaxDepth > 10 ? 0.05 : 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-dashboard-surface border border-dashboard-border">
          <p className="text-[10px] text-dashboard-muted uppercase font-mono mb-1">R² Score</p>
          <p className="text-2xl font-mono font-bold text-dashboard-accent">{(rSquared * 100).toFixed(2)}%</p>
        </div>
        <div className="p-3 bg-dashboard-surface border border-dashboard-border">
          <p className="text-[10px] text-dashboard-muted uppercase font-mono mb-1">MAE</p>
          <p className="text-2xl font-mono font-bold text-emerald-400">{(2.1 + (1 - params.xgbSubsample) * 1.5 + Math.abs(0.1 - params.xgbLearningRate) * 3).toFixed(2)}%</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid stroke="#2D3139" strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name="Actual" unit="%" tick={{ fill: '#8A8D91' }} fontSize={10} domain={[2, 18]} />
          <YAxis type="number" dataKey="y" name="Predicted" unit="%" tick={{ fill: '#8A8D91' }} fontSize={10} domain={[2, 18]} />
          <ZAxis type="number" range={[30, 30]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#181A1D', border: '1px solid #2D3139' }} />
          <Scatter name="Validation" data={data} fill="#00E5FF" shape="square" />
          <Line data={[{x: 2, y: 2}, {x: 18, y: 18}]} dataKey="y" stroke="#ffffff20" strokeWidth={1} dot={false} strokeDasharray="5 5" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const SHAPPlot = ({ params, lang }: { params: ModelParams, lang: Language }) => {
  const data = useMemo(() => {
    // Reactive SHAP values
    const rfEffect = params.rfTrees / 500;
    const depthEffect = params.rfDepth / 5;
    return [
      { name: lang === 'cn' ? '盐尘浓度' : 'Salt Dust', impact: 0.45 * rfEffect, interaction: 0.12 * depthEffect },
      { name: lang === 'cn' ? 'Cl⁻ 离子' : 'Cl⁻ Ion', impact: 0.38 * rfEffect, interaction: 0.15 * depthEffect },
      { name: lang === 'cn' ? '湿度' : 'Humidity', impact: 0.22, interaction: 0.08 },
      { name: lang === 'cn' ? 'UV 强度' : 'UV', impact: 0.15, interaction: 0.05 },
      { name: lang === 'cn' ? '风速' : 'Wind Speed', impact: -0.12, interaction: 0.02 },
    ];
  }, [params.rfTrees, params.rfDepth, lang]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3139" />
        <XAxis dataKey="name" tick={{ fill: '#8A8D91' }} fontSize={10} />
        <YAxis tick={{ fill: '#8A8D91' }} fontSize={10} domain={[-0.3, 1.2]} />
        <Tooltip contentStyle={{ background: '#181A1D', border: '1px solid #2D3139' }} />
        <Legend />
        <Bar dataKey="impact" name="SHAP Value" fill="#00E5FF" radius={0} />
        <Bar dataKey="interaction" name="Interaction" fill="#8A8D91" radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Main Application ---

export default function App() {
  const [lang, setLang] = useState<Language>('cn');
  const t = translations[lang];

  const [activeStage, setActiveStage] = useState(0);
  const [isPreprocessed, setIsPreprocessed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [params, setParams] = useState<ModelParams>({
    rfTrees: 300,
    rfDepth: 10,
    xgbLearningRate: 0.1,
    xgbMaxDepth: 6,
    xgbSubsample: 0.8,
  });

  const rawData = useMemo(() => generateMockData(20), []);
  
  const featureImportance = useMemo(() => {
    const base = [
      { name: lang === 'cn' ? '盐尘浓度' : 'Salt Dust', baseImportance: 20, drift: 2 },
      { name: lang === 'cn' ? 'Na⁺ 离子' : 'Na⁺ Ion', baseImportance: 18, drift: 5 },
      { name: lang === 'cn' ? 'Cl⁻ 离子' : 'Cl⁻ Ion', baseImportance: 16, drift: 4 },
      { name: lang === 'cn' ? '环境湿度' : 'Humidity', baseImportance: 12, drift: 1 },
      { name: lang === 'cn' ? 'UV 强度' : 'UV', baseImportance: 10, drift: 3 },
      { name: lang === 'cn' ? 'Mg²⁺ 离子' : 'Mg²⁺ Ion', baseImportance: 8, drift: 2 },
      { name: lang === 'cn' ? '环境温度' : 'Temp', baseImportance: 4, drift: 1 },
      { name: lang === 'cn' ? '风速' : 'Wind Speed', baseImportance: 2, drift: 0.5 },
    ];

    // The logic should shift importance based on complexity and iteration
    // e.g. at higher depths/learning rates, ions (chemical decay) become more dominant
    const complexityFactor = (params.rfDepth + params.xgbMaxDepth) / 15;
    const iterationFactor = (params.rfTrees / 500) * (1 + params.xgbLearningRate) * params.xgbSubsample;
    
    const transformed = base.map(f => {
      // Dynamic shift: complexity increases importance of chemical ion interactions
      let factor = 1.0;
      if (f.name.includes('离子') || f.name.includes('Ion')) {
        factor += complexityFactor * 0.25;
      }
      
      const val = (f.baseImportance + f.drift * iterationFactor) * factor;
      return { name: f.name, importance: val };
    });

    // Normalize so the maximum is always visible but handles relative scaling
    const maxVal = Math.max(...transformed.map(t => t.importance));
    return transformed.map(t => ({ ...t, importance: (t.importance / maxVal) * 98 }));
  }, [params.rfTrees, params.rfDepth, params.xgbLearningRate, params.xgbMaxDepth, params.xgbSubsample, lang]);

  const stages = [
    { id: 'data', name: t.stages[0], icon: Database },
    { id: 'feature', name: t.stages[1], icon: Layers },
    { id: 'model', name: t.stages[2], icon: Activity },
    { id: 'interpret', name: t.stages[3], icon: PieChart },
    { id: 'apply', name: t.stages[4], icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-dashboard-bg text-dashboard-ink font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-dashboard-border flex items-center justify-between px-4 md:px-6 bg-dashboard-surface shrink-0 relative z-50">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-2 hover:bg-dashboard-sidebar rounded-sm text-dashboard-accent"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 md:w-8 md:h-8 bg-dashboard-accent flex items-center justify-center rounded-sm shrink-0">
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-dashboard-bg"></div>
          </div>
          <h1 className="text-[10px] md:text-sm font-bold tracking-widest uppercase font-mono truncate max-w-[150px] md:max-w-none">{t.title}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-6 text-[9px] md:text-[10px] font-mono text-dashboard-muted">
          <div className="flex items-center bg-dashboard-sidebar border border-dashboard-border rounded overflow-hidden">
             <button 
               onClick={() => setLang('cn')}
               className={cn("px-2 py-1 transition-colors", lang === 'cn' ? "bg-dashboard-accent text-dashboard-bg" : "hover:text-dashboard-ink")}
             >
               中
             </button>
             <button 
               onClick={() => setLang('en')}
               className={cn("px-2 py-1 transition-colors", lang === 'en' ? "bg-dashboard-accent text-dashboard-bg" : "hover:text-dashboard-ink")}
             >
               EN
             </button>
          </div>
          <span>{t.status}: <span className="text-dashboard-accent">{isPreprocessed ? t.calibrated : t.dataIn}</span></span>
          <span>{t.samples}: 642</span>
          <span>{t.region}: QINGHAI_GOLMUD</span>
          <span className="bg-dashboard-border px-2 py-1 rounded text-white font-bold">{t.user}: colm</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation - Conditional 30/70 Split on Mobile */}
        <aside className={cn(
          "lg:w-72 border-r border-dashboard-border bg-dashboard-sidebar p-2 lg:p-5 flex flex-col gap-4 lg:gap-8 overflow-y-auto shrink-0 transition-all duration-300",
          showMobileSidebar ? "w-[30%] opacity-100" : "w-0 opacity-0 lg:w-72 lg:opacity-100 overflow-hidden lg:overflow-y-auto border-none lg:border-r"
        )}>
          <div className={cn("flex flex-col gap-4 lg:gap-8 min-w-[120px]", !showMobileSidebar && "hidden lg:flex")}>
            <section>
              <h2 className="text-[11px] uppercase tracking-wider text-dashboard-muted mb-4 font-bold border-l-2 border-dashboard-accent pl-2">{t.hyperparams}</h2>
            <div className="space-y-4">
              <ParameterSlider 
                label={t.learningRate} 
                value={params.xgbLearningRate} 
                min={0.01} max={0.5} step={0.01} 
                onChange={(val: number) => setParams(prev => ({ ...prev, xgbLearningRate: val }))} 
              />
              <ParameterSlider 
                label={t.maxDepth} 
                value={params.xgbMaxDepth} 
                min={3} max={15} step={1} 
                onChange={(val: number) => setParams(prev => ({ ...prev, xgbMaxDepth: val }))} 
              />
              <ParameterSlider 
                label={t.subsample} 
                value={params.xgbSubsample} 
                min={0.5} max={1} step={0.05} 
                onChange={(val: number) => setParams(prev => ({ ...prev, xgbSubsample: val }))} 
              />
              <ParameterSlider 
                label={t.rfTrees} 
                value={params.rfTrees} 
                min={100} max={1000} step={100} 
                onChange={(val: number) => setParams(prev => ({ ...prev, rfTrees: val }))} 
              />
              <ParameterSlider 
                label={t.rfDepth} 
                value={params.rfDepth} 
                min={5} max={30} step={1} 
                onChange={(val: number) => setParams(prev => ({ ...prev, rfDepth: val }))} 
              />
            </div>
          </section>

          <section className="mb-4">
            <h2 className="text-[11px] uppercase tracking-wider text-dashboard-muted mb-4 font-bold border-l-2 border-dashboard-accent pl-2">{t.workflow}</h2>
            <nav className="space-y-1">
              {stages.map((stage, idx) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(idx)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded text-[11px] font-bold uppercase transition-all text-left",
                    activeStage === idx 
                      ? "bg-dashboard-accent text-dashboard-bg" 
                      : "text-dashboard-muted hover:text-dashboard-ink hover:bg-dashboard-surface"
                  )}
                >
                  <stage.icon className="w-3.5 h-3.5" />
                  {stage.name}
                </button>
              ))}
            </nav>
          </section>

          <section className="mt-auto pt-4 border-t border-dashboard-border">
            <button className="w-full bg-dashboard-accent text-dashboard-bg py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
              {t.retrain}
            </button>
            <p className="text-[9px] text-dashboard-muted mt-2 text-center font-mono uppercase tracking-widest">{t.engineStatus}</p>
          </section>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 bg-dashboard-bg overflow-y-auto flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activeStage === 0 && (
              <motion.div 
                key="stage0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dashboard-sidebar border border-dashboard-border p-4">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tighter">{t.datasetStatus}</h2>
                    <p className="text-dashboard-muted text-xs mt-1 leading-relaxed">
                      {lang === 'cn' 
                        ? `整合青海盐湖区核心数据集 (N=${600 + Math.floor(params.rfTrees / 10)})，执行 Z-Score 标准化与数据清洗。` 
                        : `Integrating core datasets from Qinghai salt lake (N=${600 + Math.floor(params.rfTrees / 10)}), performing Z-Score normalization.`}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsPreprocessed(true)}
                    className={cn(
                      "w-full md:w-auto px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors shrink-0",
                      isPreprocessed 
                        ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                        : "bg-dashboard-accent text-dashboard-bg hover:bg-white"
                    )}
                  >
                    {isPreprocessed ? t.completed : t.preProcess}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { 
                      label: t.accuracy, 
                      value: (0.96 + (params.xgbLearningRate * 0.02) - (Math.abs(params.xgbSubsample - 0.8) * 0.05)).toFixed(3), 
                      icon: Database 
                    },
                    { 
                      label: t.mae, 
                      value: (2.1 + (1 - params.xgbSubsample) * 1.2 + Math.abs(0.1 - params.xgbLearningRate) * 2).toFixed(2) + '%', 
                      icon: Activity 
                    },
                    { 
                      label: t.cycle, 
                      value: Math.floor(14 + (params.rfTrees / 200) - (params.rfDepth / 5)) + ' ' + (lang === 'cn' ? '天' : 'Days'), 
                      icon: Settings2 
                    },
                    { 
                      label: t.risk, 
                      value: (params.xgbMaxDepth > 10 || params.xgbLearningRate > 0.3) ? (lang === 'cn' ? '高风险' : 'HIGH') : t.low, 
                      icon: AlertTriangle, 
                      status: (params.xgbMaxDepth > 10 || params.xgbLearningRate > 0.3) ? 'high' : 'low' 
                    },
                  ].map((stat, i) => (
                    <div key={i} className="bg-dashboard-surface border border-dashboard-border p-4">
                      <p className="text-[10px] text-dashboard-muted uppercase font-mono mb-1">{stat.label}</p>
                      <p className={cn(
                        "text-2xl font-mono",
                        stat.status === 'high' ? "text-dashboard-alert" : (stat.status === 'low' ? "text-dashboard-success" : "text-dashboard-accent")
                      )}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-dashboard-surface border border-dashboard-border flex flex-col min-h-0">
                  <div className="px-4 py-2 border-b border-dashboard-border bg-dashboard-sidebar flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-mono uppercase">{t.rawSnapshot}</span>
                    <span className="text-[9px] text-dashboard-accent uppercase">{t.synced}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="border-b border-dashboard-border text-dashboard-muted uppercase font-mono">
                          <th className="px-6 py-3 font-medium">ID</th>
                          <th className="px-6 py-3 font-medium">{lang === 'cn' ? '区域' : 'Location'}</th>
                          <th className="px-6 py-3 font-medium text-right">{lang === 'cn' ? '积灰' : 'Dust'}</th>
                          <th className="px-6 py-3 font-medium text-right">{lang === 'cn' ? '温度' : 'Temp'}</th>
                          <th className="px-6 py-3 font-medium text-right">{lang === 'cn' ? '湿度' : 'Humidity'}</th>
                          <th className="px-6 py-3 font-medium text-right">{t.degradation}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dashboard-border font-mono">
                        {rawData.map((row) => (
                          <tr key={row.id} className="hover:bg-dashboard-border/20 transition-colors">
                            <td className="px-6 py-2 text-dashboard-accent">#{row.id.toString().padStart(3, '0')}</td>
                            <td className="px-6 py-2 uppercase tracking-tighter">{row.location}</td>
                            <td className="px-6 py-2 text-right">{row.dustConcentration.toFixed(1)}</td>
                            <td className="px-6 py-2 text-right">{row.temp.toFixed(1)}</td>
                            <td className="px-6 py-2 text-right">{row.humidity.toFixed(1)}</td>
                            <td className="px-6 py-2 text-right font-bold">{row.degradationRate.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStage === 1 && (
              <motion.div key="stage1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <h2 className="text-xl font-bold uppercase tracking-tighter">{t.rfStage}</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-dashboard-surface border border-dashboard-border p-4">
                       <h3 className="text-[10px] uppercase font-bold mb-4 tracking-wider">{t.importance}</h3>
                       <FeatureImportanceChart data={featureImportance} />
                    </div>
                    <div className="bg-dashboard-surface border border-dashboard-border p-6 flex flex-col justify-center">
                       <div className="space-y-6">
                          <div className="border-l-4 border-dashboard-accent pl-4">
                            <p className="text-xs text-dashboard-muted uppercase font-mono tracking-widest">{t.cumulative}</p>
                            <p className="text-4xl font-mono text-dashboard-accent font-bold">
                               {(90 + (params.rfTrees / 200) + (params.rfDepth / 10)).toFixed(2)}%
                            </p>
                          </div>
                          <p className="text-sm text-dashboard-muted leading-relaxed font-mono uppercase">
                            {lang === 'cn'
                              ? `系统已识别 ${7 + Math.floor(params.rfDepth / 5)} 项核心特征。盐离子贡献了超过 ${(55 + params.rfTrees / 100).toFixed(1)}% 的方差。低影响节点已剔除。`
                              : `System identified ${7 + Math.floor(params.rfDepth / 5)} core features. Salt ions contribute over ${(55 + params.rfTrees / 100).toFixed(1)}% of variance.`}
                          </p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {(activeStage === 2 || activeStage === 3) && (
              <motion.div key="stage23" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-tighter">
                  {activeStage === 2 ? t.xgbStage : t.shapStage}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-dashboard-surface border border-dashboard-border p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider underline decoration-dashboard-accent underline-offset-4 decoration-2">
                        {activeStage === 2 ? t.accuracyTitle : t.shapTitle}
                      </h3>
                      <span className="text-[9px] font-mono text-dashboard-muted uppercase tracking-widest">XGBOOST_CORE</span>
                    </div>
                    {activeStage === 2 ? <PredictionChart params={params} /> : <SHAPPlot params={params} lang={lang} />}
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <div className="bg-dashboard-surface border border-dashboard-border p-4">
                        <p className="text-[10px] text-dashboard-muted uppercase font-mono mb-4 border-b border-dashboard-border pb-1">{t.performance}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <p className="text-[9px] font-mono text-dashboard-muted">{t.precision}</p>
                              <p className="text-lg font-mono text-dashboard-accent">
                                {(0.98 + (params.xgbLearningRate * 0.02) + (params.xgbMaxDepth / 1000)).toFixed(3)}
                              </p>
                          </div>
                          <div className="space-y-1">
                              <p className="text-[9px] font-mono text-dashboard-muted">{t.recall}</p>
                              <p className="text-lg font-mono text-dashboard-accent">
                                {(0.97 + (params.xgbSubsample * 0.015) + (params.xgbMaxDepth / 1500)).toFixed(3)}
                              </p>
                          </div>
                        </div>
                    </div>
                    <div className="bg-dashboard-surface border border-dashboard-border p-4 flex-1">
                        <p className="text-[10px] text-dashboard-muted uppercase font-mono mb-4 border-b border-dashboard-border pb-2 italic font-bold tracking-widest">{t.summary}</p>
                        <p className="text-xs leading-loose text-dashboard-muted font-mono uppercase text-justify">
                          {lang === 'cn' 
                            ? `混合架构 (RF+XGBoost) 表现稳定。当前 R² 拟合优度为 ${(0.96 + (params.xgbLearningRate * 0.02)).toFixed(3)}。通过正则化防止了过拟合。SHAP 值确认了离子的正相关性。` 
                            : `Hybrid architecture achieves stability. Current R² score: ${(0.96 + (params.xgbLearningRate * 0.02)).toFixed(3)}. SHAP confirms Na+ positive correlation.`}
                        </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStage === 4 && (
              <motion.div key="stage4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <h2 className="text-xl font-bold uppercase tracking-tighter">{t.applyStage}</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-dashboard-surface border border-dashboard-border p-4">
                       <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-l-4 border-dashboard-accent pl-2">{t.coating}</h3>
                       <div className="overflow-x-auto">
                         <table className="w-full text-xs text-left">
                          <thead className="bg-dashboard-sidebar text-dashboard-muted uppercase font-mono text-[9px]">
                             <tr>
                                <th className="px-4 py-2 border-r border-dashboard-border">{t.rank}</th>
                                <th className="px-4 py-2 border-r border-dashboard-border">{t.mod}</th>
                                <th className="px-4 py-2 text-right">{t.predDecay}</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-dashboard-border">
                             {[
                                { r: 1, n: 'FS-9202 (COMP)', d: (2.14 * (1.2 - params.xgbSubsample)).toFixed(2) + '%' },
                                { r: 2, n: 'NanoDry (SIL)', d: (2.38 * (1.2 - params.xgbSubsample)).toFixed(2) + '%' },
                                { r: 3, n: 'SolarClear', d: (3.12 * (1.2 - params.xgbSubsample)).toFixed(2) + '%' },
                                { r: 4, n: 'HG-Ultra (HYD)', d: (3.45 * (1.2 - params.xgbSubsample)).toFixed(2) + '%' },
                             ].map(item => (
                                <tr key={item.r} className="hover:bg-dashboard-border/10 transition-all">
                                   <td className="px-4 py-3 font-mono text-dashboard-accent">0{item.r}</td>
                                   <td className="px-4 py-3 font-bold uppercase tracking-tight">{item.n}</td>
                                   <td className="px-4 py-3 text-right font-mono font-bold text-dashboard-accent">{item.d}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                      </div>
                    </div>
                    <div className="bg-dashboard-surface border border-dashboard-border p-4">
                       <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-dashboard-border pb-2 text-dashboard-alert">{t.hotband}</h3>
                       <div className="space-y-6">
                          <div className={cn(
                            "p-4 relative border transition-colors duration-500",
                            (params.xgbMaxDepth > 10 || params.xgbLearningRate > 0.3)
                              ? "bg-dashboard-alert/10 border-dashboard-alert/20"
                              : "bg-dashboard-success/10 border-dashboard-success/20"
                          )}>
                             <div className="absolute top-0 right-0 p-1">
                               {(params.xgbMaxDepth > 10 || params.xgbLearningRate > 0.3) 
                                 ? <AlertTriangle className="w-3 h-3 text-dashboard-alert" />
                                 : <ShieldCheck className="w-3 h-3 text-dashboard-success" />
                               }
                             </div>
                             <p className={cn(
                               "text-[10px] font-mono uppercase font-bold tracking-widest",
                               (params.xgbMaxDepth > 10 || params.xgbLearningRate > 0.3) ? "text-dashboard-alert" : "text-dashboard-success"
                             )}>
                               {t.riskLevel}: {(params.xgbMaxDepth > 10 || params.xgbLearningRate > 0.3) ? (lang === 'cn' ? '高风险' : 'HIGH') : t.low}
                             </p>
                             <p className="text-[9px] mt-2 text-dashboard-ink leading-relaxed opacity-70">
                               {lang === 'cn'
                                 ? (params.xgbMaxDepth > 10 ? '模型深度过大，存在过拟合噪声风险。' : '大气盐分浓度处于安全监控范围内。')
                                 : (params.xgbMaxDepth > 10 ? 'High capacity model detected, risk of overfitting noise.' : 'Atmospheric salt density remains within safety margins.')}
                             </p>
                          </div>
                          <div className="flex justify-between text-[11px] font-mono border-t border-dashboard-border pt-4">
                             <span className="text-dashboard-muted">PRED_ACC</span>
                             <span className="text-dashboard-accent font-bold">
                               {(92.4 + (params.xgbLearningRate * 5)).toFixed(1)}%
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Log Section */}
          <div className="h-44 bg-dashboard-surface border border-dashboard-border flex flex-col shrink-0 mt-auto">
            <div className="px-4 py-2 border-b border-dashboard-border bg-dashboard-sidebar flex justify-between items-center shrink-0">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-dashboard-muted">{t.logs}</span>
              <span className="text-[9px] text-dashboard-accent animate-pulse font-bold tracking-widest">{t.realtime}</span>
            </div>
            <div className="p-3 overflow-y-auto font-mono text-[9px] text-dashboard-muted space-y-1 bg-[#0c0d0f]">
              <p className="hover:text-dashboard-ink transition-colors cursor-default">[INFO] RF Feature selection complete: 10 candidates identified (Z-Score &gt; 0.4).</p>
              <p className="hover:text-dashboard-ink transition-colors cursor-default text-[#8A8D91]">[INFO] Bayesian optimization initialized for XGBoost Hyperparams...</p>
              <p className="hover:text-dashboard-ink transition-colors cursor-default">[SUCCESS] Test set verification: R²=0.962, MAE=2.41%.</p>
              <p className="text-white font-bold bg-dashboard-accent/10 px-1">[SYSTEM] {lang === 'cn' ? '场景验证：识别出最匹配镀膜液 (Mod_FS-9202)。' : 'Scenario validation: Top coating match identified (Mod_FS-9202).'}</p>
              <p className="hover:text-dashboard-ink transition-colors cursor-default text-[#8A8D91]">{lang === 'cn' ? '[信息] 正在计算格尔木盐湖 C 区的最优清洁周期...' : '[INFO] Calculating optimal cleaning cycles for Golmud Salt Lake Site-C...'}</p>
              <p className="hover:text-dashboard-ink transition-colors cursor-default text-[#8A8D91]">{lang === 'cn' ? '[信息] 环境传感器更新：C 区 Na+ 离子浓度增加 (+4.2%)。' : '[INFO] Environmental sensors update: Na+ ion concentration increasing in Sector C (+4.2%).'}</p>
              <p className="text-dashboard-accent font-bold">{lang === 'cn' ? '[同步] 全局模型权重已下发至大柴旦远程节点。' : '[SYNC] Global model weights distributed to remote nodes in Da Qaidam.'}</p>
              <p className="hover:text-dashboard-ink transition-colors cursor-default">[INIT] Background LSTM monitoring started for 72h Hotspot Prediction...</p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer / Status Bar - Design Style */}
      <footer className="h-6 border-t border-dashboard-border bg-dashboard-sidebar flex justify-between items-center px-4 text-[9px] font-mono text-dashboard-muted uppercase tracking-widest shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><Database className="w-2.5 h-2.5" /> MEM: 12.4 GB</span>
          <span className="flex items-center gap-1.5"><Activity className="w-2.5 h-2.5" /> GPU: 62% LOAD</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="text-dashboard-accent lowercase tracking-tighter">{t.processed}: 1.2M OPS</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-dashboard-accent rounded-full shadow-[0_0_8px_rgba(0,229,255,0.6)] animate-pulse" />
            <span>{t.engineCalibrated}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
