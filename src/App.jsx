import React, { useState, useMemo, useEffect } from 'react';
import { Leaf, Car, Zap, Utensils, CheckCircle2, Trophy, Trash2, Download, Upload, ShieldAlert, Award, Sun, Moon, RefreshCw, Calendar, TrendingUp, Sliders, Play, Square, Cpu, Droplet } from 'lucide-react';

const REGIONAL_GRIDS = {
  GLOBAL_AVG: { label: "Global Average Mix", factor: 0.40 },
  US_EAST: { label: "US East Grid (Coal/Gas)", factor: 0.45 },
  EU_WEST: { label: "EU West Grid (Renewables)", factor: 0.12 },
  IN_GRID: { label: "India National Grid (Coal)", factor: 0.72 }
};

const ENTERPRISE_HABITS = [
  { id: 1, text: "Unplugged vampire loads from household ports", points: 5, completed: false },
  { id: 2, text: "Swapped a regional flight with virtual meeting tools", points: 50, completed: false },
  { id: 3, text: "Walked, cycled, or rode public transit layers", points: 15, completed: false },
  { id: 4, text: "Opted for a locally sourced plant-based meal", points: 10, completed: false },
  { id: 5, text: "Lowered climate control cycles by exactly 1 hour", points: 8, completed: false }
];

export default function App() {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('eco_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, category: 'Transport', type: 'Car Run', amount: 5, co2: 0.9, date: '10/06/2026', time: '02:00 PM' },
      { id: 2, category: 'Energy', type: 'Electricity Grid', amount: 2, co2: 0.8, date: '10/06/2026', time: '02:05 PM' },
    ];
  });
  const [actions, setActions] = useState(() => {
    const saved = localStorage.getItem('eco_actions');
    return saved ? JSON.parse(saved) : ENTERPRISE_HABITS;
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('eco_theme') === 'dark');
  const [offsetCredits, setOffsetCredits] = useState(() => parseFloat(localStorage.getItem('eco_offsets') || '0.0'));
  const [selectedGrid, setSelectedGrid] = useState('GLOBAL_AVG');
  const [sandboxReduction, setSandboxReduction] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(3000);
  
  const [transportDist, setTransportDist] = useState('');
  const [energyAmount, setEnergyAmount] = useState('');
  const [foodAmount, setFoodAmount] = useState('');
  const [waterAmount, setWaterAmount] = useState('');
  useEffect(() => { localStorage.setItem('eco_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('eco_actions', JSON.stringify(actions)); }, [actions]);
  useEffect(() => { localStorage.setItem('eco_theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { localStorage.setItem('eco_offsets', offsetCredits.toString()); }, [offsetCredits]);

  const handleImportJSON = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    const r = new FileReader();
    r.onload = (evt) => {
      try {
        const d = JSON.parse(evt.target.result);
        if (d.history) { setLogs(d.history); setOffsetCredits(d.summary?.offsetCredits || 0); alert("Data Verified & Hydrated."); }
      } catch { alert("Invalid File Schema."); }
    };
    r.readAsText(file);
  };
  const handleAddLog = (cat, type, key, val) => {
    const amt = parseFloat(val); if (!amt || amt <= 0) return;
    
    let factor = 0.18; 
    if (key === 'electricity_per_kwh') factor = REGIONAL_GRIDS[selectedGrid].factor;
    else if (key === 'meat_meal') factor = 2.5;
    else if (key === 'water_liters') factor = 0.002;

    setLogs([{ id: Date.now(), category: cat, type, amount: amt, co2: parseFloat((amt * factor).toFixed(2)), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...logs]);
  };

  useEffect(() => {
    let timer = null;
    if (isSimulating) {
      timer = setInterval(() => {
        const variants = [
          { cat: 'Transport', type: 'Fleet Move', key: 'gas_per_km', val: (Math.random() * 10 + 1).toFixed(1) },
          { cat: 'Energy', type: 'Grid Load Draw', key: 'electricity_per_kwh', val: (Math.random() * 15 + 2).toFixed(1) },
          { cat: 'Food', type: 'Cafeteria Catering Batch', key: 'meat_meal', val: "2" }
        ];
        const picked = variants[Math.floor(Math.random() * variants.length)];
        handleAddLog(picked.cat, picked.type, picked.key, picked.val);
      }, simSpeed);
    }
    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, selectedGrid, logs]);

  const handlePurchaseOffset = () => {
    if (totalPoints >= 15) {
      setOffsetCredits(prev => prev + 1.0);
      setActions(actions.map(a => ({ ...a, completed: false })));
      alert("Offset Action Success: -1.0kg CO2 wiped off ledger.");
    } else { alert("Insufficient XP credit lines."); }
  };

  const handleExportCSV = () => {
    let s = "Category,Type,Units,CO2(kg)\n";
    logs.forEach(l => { s += `${l.category},${l.type},${l.amount},${l.co2}\n`; });
    const b = new Blob([s], { type: 'text/csv' });
    const url = URL.createObjectURL(b); window.open(url);
  };
  const baseCO2 = useMemo(() => logs.reduce((s, i) => s + i.co2, 0), [logs]);
  const totalCO2 = useMemo(() => Math.max(baseCO2 - offsetCredits, 0).toFixed(1), [baseCO2, offsetCredits]);
  const totalPoints = useMemo(() => actions.filter(a => a.completed).reduce((s, i) => s + i.points, 0), [actions]);
  const intensityVelocity = useMemo(() => logs.length === 0 ? '0.00' : (parseFloat(totalCO2) / logs.length).toFixed(2), [totalCO2, logs]);
  const simulatedSavings = useMemo(() => (parseFloat(totalCO2) * (sandboxReduction / 100)).toFixed(1), [totalCO2, sandboxReduction]);

  const realTimeGraphPath = useMemo(() => {
    if (logs.length === 0) return "M 0 45 L 300 45";
    const reversed = [...logs].reverse().slice(-10);
    const max = Math.max(...reversed.map(p => p.co2), 5);
    const min = Math.min(...reversed.map(p => p.co2), 0);
    return reversed.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx / Math.max(reversed.length - 1, 1)) * 280 + 10} ${75 - ((p.co2 - min) / (max - min || 1)) * 55}`).join(' ');
  }, [logs]);

  const ecoTier = useMemo(() => {
    const s = parseFloat(totalCO2);
    if (s === 0) return { name: "Net Zero Hero", color: "#10b981", bg: darkMode ? '#064e3b' : '#ecfdf5', pct: 100 };
    if (s < 10) return { name: "Eco Elite Tier", color: "#059669", bg: darkMode ? '#064e3b' : '#f0fdf4', pct: 85 };
    return { name: "Climate Deficit", color: "#ef4444", bg: darkMode ? '#451a03' : '#fef2f2', pct: 25 };
  }, [totalCO2, darkMode]);

  const theme = {
    bg: darkMode ? '#0f172a' : '#f8fafc', card: darkMode ? '#1e293b' : 'white',
    text: darkMode ? '#f8fafc' : '#1e293b', border: darkMode ? '#334155' : '#e2e8f0', input: darkMode ? '#334155' : '#f8fafc'
  };
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', maxWidth: '1000px', margin: '0 auto', color: theme.text, backgroundColor: theme.bg, minHeight: '100vh', transition: 'all 0.2s' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.card, padding: '15px 20px', borderRadius: '16px', border: `1px solid ${theme.border}`, marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}><Leaf color="#16a34a"/> EcoTrace Ultra</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', color: theme.text, cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          <select value={selectedGrid} onChange={(e) => setSelectedGrid(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontSize: '12px', fontWeight: '600' }}>
            {Object.keys(REGIONAL_GRIDS).map(g => <option key={g} value={g}>{REGIONAL_GRIDS[g].label}</option>)}
          </select>
          <div style={{ backgroundColor: ecoTier.bg, color: ecoTier.color, padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>{ecoTier.name}</div>
          <label style={{ padding: '6px 12px', background: '#10b981', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Import JSON <input type="file" onChange={handleImportJSON} style={{ display: 'none' }} /></label>
          <button onClick={handleExportCSV} style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Export CSV</button>
          <button onClick={() => { setLogs([]); setActions(ENTERPRISE_HABITS); setOffsetCredits(0); setIsSimulating(false); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Reset</button>
          <div style={{ background: '#ecfdf5', color: '#065f46', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' }}>{totalPoints} XP</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: darkMode ? '#1e293b' : '#0f172a', color: 'white', padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: '700' }}>NET CARBON DEFICIT TELEMETRY</span>
              <h2 style={{ fontSize: '36px', margin: '2px 0', fontWeight: '800' }}>{totalCO2} <span style={{ fontSize: '14px', opacity: 0.4 }}>kg CO₂e</span></h2>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>Velocity Ratio: {intensityVelocity} kg/stream • Centile Rank: Top {100 - ecoTier.pct}%</div>
            </div>
            <div style={{ background: '#ec4899', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>Live Ingestion Ticker</div>
          </div>
          <div style={{ width: '100%', height: '70px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none"><path d={realTimeGraphPath} fill="transparent" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ marginTop: '4px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '11px', color: '#94a3b8' }}>
            Active Region Carbon Intensity Coefficient: <b style={{ color: '#22d3ee' }}>{REGIONAL_GRIDS[selectedGrid].factor} kg / kWh</b>
          </div>
        </div>

        <div style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#ec4899', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={12}/> IoT Stream Simulator</div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.3' }}>Pipes dynamic data logs asynchronously straight into the tracker memory state loops.</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', mt: '5px' }}>
            <button onClick={() => setIsSimulating(!isSimulating)} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '10px', cursor: 'pointer', background: isSimulating ? '#ef4444' : '#ec4899' }}>{isSimulating ? 'Stop Stream' : 'Live Build'}</button>
            <select value={simSpeed} onChange={(e) => setSimSpeed(parseInt(e.target.value))} style={{ padding: '4px', borderRadius: '6px', fontSize: '10px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }}><option value="1000">1s</option><option value="3000">3s</option></select>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, padding: '14px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '12px' }}><Sliders size={12}/> What-If Simulation Sandbox</div>
          <input type="range" min="5" max="50" step="5" value={sandboxReduction} onChange={(e) => setSandboxReduction(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer', marginTop: '4px' }} />
          <div style={{ fontSize: '11px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', mt: '4px' }}><span>Goal Path: {sandboxReduction}% Drop</span><span style={{ color: '#3b82f6' }}>Prevents: -{simulatedSavings} kg</span></div>
        </div>
        <div style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, padding: '14px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ maxWidth: '65%' }}><div style={{ color: '#16a34a', fontWeight: '700', fontSize: '12px' }}><RefreshCw size={12}/> OFFSET VAULT</div><p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Trade 15 Green XP tokens to issue an immediate footprint ledger credit line offset.</p></div>
          <button onClick={handlePurchaseOffset} style={{ padding: '8px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Trade 15XP</button>
        </div>
      </div>

      {/* Control Nodes and Habit Pipeline Split Grids Balanced Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', alignItems: 'stretch' }}>
        <div style={{ background: theme.card, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ marginTop: 0, fontSize: '13px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>DATA PROCESSING INPUTS</h3>
          <div style={{ padding: '10px', background: theme.input, borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}><Car size={12}/> Transport (km)</label>
            <input type="number" value={transportDist} onChange={e => setTransportDist(e.target.value)} style={{ padding: '6px', width: '70px', marginRight: '5px', background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
            <button onClick={() => { handleAddLog('Transport', 'Car Run', 'gasoline_per_km', transportDist); setTransportDist(''); }} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>Add</button>
          </div>
          <div style={{ padding: '10px', background: theme.input, borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}><Zap size={12}/> Energy Load (kWh)</label>
            <input type="number" value={energyAmount} onChange={e => setEnergyAmount(e.target.value)} style={{ padding: '6px', width: '70px', marginRight: '5px', background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
            <button onClick={() => { handleAddLog('Energy', 'Electricity Grid', 'electricity_per_kwh', energyAmount); setEnergyAmount(''); }} style={{ padding: '6px 12px', background: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>Compute</button>
          </div>
          <div style={{ padding: '10px', background: theme.input, borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}><Utensils size={12}/> Food Dietary Ingestion (Meals)</label>
            <input type="number" value={foodAmount} onChange={e => setFoodAmount(e.target.value)} style={{ padding: '6px', width: '70px', marginRight: '5px', background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
            <button onClick={() => { handleAddLog('Food', 'Meat Meal', 'meat_meal', foodAmount); setFoodAmount(''); }} style={{ padding: '6px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>Compute</button>
          </div>
          <div style={{ padding: '10px', background: theme.input, borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}><Droplet size={12}/> Water Consumption (Liters)</label>
            <input type="number" value={waterAmount} onChange={e => setWaterAmount(e.target.value)} style={{ padding: '6px', width: '70px', marginRight: '5px', background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px' }} />
            <button onClick={() => { handleAddLog('Water', 'Water Processing Treatment', 'water_liters', waterAmount); setWaterAmount(''); }} style={{ padding: '6px 12px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>Compute</button>
          </div>
        </div>

        <div style={{ background: theme.card, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>SCROLLABLE HABIT INTERCEPTOR</h3>
          <div style={{ flex: 1, maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            {actions.map(a => (
              <div key={a.id} onClick={() => setActions(actions.map(act => act.id === a.id ? { ...act, completed: !act.completed } : act))} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: `1px solid ${theme.border}`, borderRadius: '10px', marginBottom: '6px', cursor: 'pointer', background: a.completed ? theme.input : theme.card, opacity: a.completed ? 0.6 : 1, borderLeft: a.completed ? '4px solid #10b981' : '4px solid #cbd5e1', transition: 'all 0.1s' }}>
                <CheckCircle2 size={14} color={a.completed ? '#10b981' : '#cbd5e1'} style={{ fill: a.completed ? '#dcfce7' : 'transparent' }} className="flex-shrink-0" />
                <span style={{ fontSize: '11px', fontWeight: '600', color: theme.text }}>{a.text}</span>
                <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', background: '#f1f5f9', color: '#475569' }}>+{a.points}XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: theme.card, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}`, marginTop: '24px' }}>
        <h3 style={{ marginTop: 0, fontSize: '13px', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Persistent Audit Ledger</h3>
        {logs.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>Ledger history logs clear.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: theme.input, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}><span style={{ color: log.category === 'Transport' ? '#3b82f6' : log.category === 'Energy' ? '#eab308' : (log.category === 'Food' ? '#22c55e' : '#06b6d4'), marginRight: '4px' }}>[{log.category}]</span> {log.type} ({log.amount} units)</span>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}><Calendar size={10}/> {log.date} at {log.time}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{log.co2} kg</span>
                  <button onClick={() => setLogs(logs.filter(l => l.id !== log.id))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
