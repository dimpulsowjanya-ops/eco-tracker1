import React, { useState, useCallback, createContext, useContext } from 'react';
import { Header } from './components/Header.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { EmissionsChart } from './components/EmissionsChart.jsx';
import { ActivityLogger } from './components/ActivityLogger.jsx';
import { HabitTracker } from './components/HabitTracker.jsx';
import { AISuggestions } from './components/AISuggestions.jsx';
import { WhatIfSimulator } from './components/WhatIfSimulator.jsx';
import { AuditLedger } from './components/AuditLedger.jsx';
import { OffsetVault } from './components/OffsetVault.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useToast } from './hooks/useToast.js';
import { useCarbonCalculator } from './hooks/useCarbonCalculator.js';
import { GREEN_HABITS, LEVELS, OFFSET_PROJECTS } from './constants/carbonFactors.js';
import { logsToCSV, buildExportPayload, triggerDownload } from './utils/exporters.js';
import { validateImportSchema } from './utils/validators.js';

// ── App Context ──────────────────────────────────────────────────────────────
export const AppContext = createContext(null);
export const useAppContext = () => useContext(AppContext);

// ── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  // Persistent state
  const [logs, setLogs]                   = useLocalStorage('eco_logs_v2', []);
  const [habits, setHabits]               = useLocalStorage('eco_habits_v2', GREEN_HABITS);
  const [darkMode, setDarkMode]           = useLocalStorage('eco_theme_v2', false);
  const [offsetCredits, setOffsetCredits] = useLocalStorage('eco_offsets_v2', 0);
  const [selectedGrid, setSelectedGrid]   = useLocalStorage('eco_grid_v2', 'GLOBAL_AVG');

  // Gamification & Budget state
  const [currentXP, setCurrentXP]         = useLocalStorage('eco_current_xp_v3', 0);
  const [lifetimeXP, setLifetimeXP]       = useLocalStorage('eco_lifetime_xp_v3', 0);
  const [carbonBudget, setCarbonBudget]   = useLocalStorage('eco_budget_v3', 50); // weekly budget (kg)

  // Lifestyle Choices state for the What-If Simulator
  const [lifestyleChoices, setLifestyleChoices] = useLocalStorage('eco_lifestyle_choices_v3', {
    transitEV: false,
    greenTariff: false,
    plantDiet: false,
    shortShowers: false,
    circularFashion: false,
  });

  // Toast System
  const { toasts, addToast, removeToast } = useToast();

  // All computed metrics
  const metrics = useCarbonCalculator(logs, offsetCredits, lifestyleChoices, habits, lifetimeXP);

  // Apply theme
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddLog = useCallback((entry) => {
    const newEntry = { id: Date.now(), ...entry };
    setLogs(prev => [newEntry, ...prev]);
    addToast(`Logged: ${entry.type} — ${entry.co2} kg CO₂e`, 'success');
  }, [setLogs, addToast]);

  const handleDeleteLog = useCallback((id) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    addToast('Entry removed from your log.', 'info');
  }, [setLogs, addToast]);

  const handleToggleHabit = useCallback((habitId) => {
    setHabits(prev => {
      const habit = prev.find(h => h.id === habitId);
      if (!habit) return prev;
      const isCompleting = !habit.completed;
      const points = habit.points || 0;

      if (isCompleting) {
        setCurrentXP(c => c + points);
        setLifetimeXP(l => {
          const newXP = l + points;
          // Level check
          const oldLvl = LEVELS.find(lvl => l >= lvl.minXP && l <= lvl.maxXP) ?? LEVELS[0];
          const newLvl = LEVELS.find(lvl => newXP >= lvl.minXP && newXP <= lvl.maxXP) ?? LEVELS[LEVELS.length - 1];
          if (newLvl.num > oldLvl.num) {
            addToast(`🎉 Level Up! You are now a ${newLvl.title}!`, 'success');
          }
          return newXP;
        });
        addToast(`✅ Habit completed! +${points} XP earned`, 'success');
      } else {
        setCurrentXP(c => Math.max(0, c - points));
        setLifetimeXP(l => Math.max(0, l - points));
        addToast(`Habit unchecked: -${points} XP`, 'info');
      }

      return prev.map(h => h.id === habitId ? { ...h, completed: isCompleting } : h);
    });
  }, [setHabits, setCurrentXP, setLifetimeXP, addToast]);

  const handlePurchaseOffset = useCallback((projectId) => {
    const project = OFFSET_PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    if (currentXP >= project.cost) {
      setCurrentXP(prev => prev - project.cost);
      setOffsetCredits(prev => prev + project.co2);
      // Uncheck all habits to make them repeatable, but keep XP!
      setHabits(prev => prev.map(h => ({ ...h, completed: false })));
      addToast(`🌲 Offset Applied! -${project.cost} XP. Offset: ${project.co2} kg CO₂e.`, 'success');
    } else {
      addToast(`You need ${project.cost - currentXP} more XP for this project. Complete green habits.`, 'warning');
    }
  }, [currentXP, setOffsetCredits, setHabits, addToast, setCurrentXP]);

  const handleReset = useCallback(() => {
    if (!window.confirm('Reset all data? This cannot be undone.')) return;
    setLogs([]);
    setHabits(GREEN_HABITS);
    setOffsetCredits(0);
    setCurrentXP(0);
    setLifetimeXP(0);
    setCarbonBudget(50);
    setLifestyleChoices({
      transitEV: false,
      greenTariff: false,
      plantDiet: false,
      shortShowers: false,
      circularFashion: false,
    });
    addToast('All data has been reset.', 'info');
  }, [setLogs, setHabits, setOffsetCredits, setCurrentXP, setLifetimeXP, setCarbonBudget, setLifestyleChoices, addToast]);

  const handleExportCSV = useCallback(() => {
    if (logs.length === 0) { addToast('No data to export.', 'warning'); return; }
    const csv = logsToCSV(logs);
    triggerDownload(csv, `ecotrace-export-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    addToast('CSV exported successfully.', 'success');
  }, [logs, addToast]);

  const handleExportJSON = useCallback(() => {
    if (logs.length === 0) { addToast('No data to export.', 'warning'); return; }
    const payload = buildExportPayload(logs, offsetCredits, metrics.netCO2, currentXP);
    const enrichedPayload = {
      ...payload,
      summary: {
        ...payload.summary,
        lifetimeXP,
        carbonBudget,
      }
    };
    triggerDownload(JSON.stringify(enrichedPayload, null, 2), `ecotrace-export-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    addToast('JSON exported successfully.', 'success');
  }, [logs, offsetCredits, metrics.netCO2, currentXP, lifetimeXP, carbonBudget, addToast]);

  const handleImportJSON = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        const { valid, error } = validateImportSchema(data);
        if (!valid) { addToast(`Import failed: ${error}`, 'error'); return; }
        setLogs(data.history);
        if (data.summary) {
          if (data.summary.offsetCredits !== undefined) setOffsetCredits(data.summary.offsetCredits);
          if (data.summary.xpPoints !== undefined) {
            setCurrentXP(data.summary.xpPoints);
            setLifetimeXP(data.summary.xpPoints);
          }
          if (data.summary.lifetimeXP !== undefined) setLifetimeXP(data.summary.lifetimeXP);
          if (data.summary.carbonBudget !== undefined) setCarbonBudget(data.summary.carbonBudget);
        }
        addToast(`Imported ${data.history.length} entries successfully.`, 'success');
      } catch {
        addToast('Import failed: Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [setLogs, setOffsetCredits, setCurrentXP, setLifetimeXP, setCarbonBudget, addToast]);

  return (
    <AppContext.Provider value={{ darkMode }}>
      <div className="app-root">
        {/* Skip link target */}
        <div id="main-content" tabIndex={-1} className="sr-only">Main content</div>

        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(p => !p)}
          selectedGrid={selectedGrid}
          onGridChange={setSelectedGrid}
          ecoTier={metrics.ecoTier}
          userLevel={metrics.userLevel}
          xpPoints={currentXP}
          onReset={handleReset}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
        />

        <main className="main-layout">
          {/* Row 1: Dashboard + Chart */}
          <div className="grid-2-3">
            <Dashboard
              netCO2={metrics.netCO2}
              grossCO2={metrics.grossCO2}
              dailyAvgNetCO2={metrics.dailyAvgNetCO2}
              dailyAvgGrossCO2={metrics.dailyAvgGrossCO2}
              activeDays={metrics.activeDays}
              offsetCredits={offsetCredits}
              logCount={logs.length}
              globalComparison={metrics.globalComparison}
              ecoTier={metrics.ecoTier}
              intensityPerEntry={metrics.intensityPerEntry}
              carbonBudget={carbonBudget}
              onBudgetChange={setCarbonBudget}
              chartData={metrics.chartData}
            />
            <EmissionsChart
              chartData={metrics.chartData}
              categoryBreakdown={metrics.categoryBreakdown}
            />
          </div>

          {/* Row 2: AI Suggestions (full width) */}
          <AISuggestions
            aiResults={metrics.aiResults}
            logCount={logs.length}
            logs={logs}
            currentXP={currentXP}
            levelTitle={metrics.userLevel.title}
            budget={carbonBudget}
          />

          {/* Row 3: Activity Logger + Habit Tracker */}
          <div className="grid-1-1">
            <ActivityLogger
              selectedGrid={selectedGrid}
              onAdd={handleAddLog}
            />
            <HabitTracker
              habits={habits}
              onToggle={handleToggleHabit}
              xpPoints={currentXP}
            />
          </div>

          {/* Row 4: What-If + Offset Vault */}
          <div className="grid-1-1">
            <WhatIfSimulator
              netCO2={metrics.netCO2}
              dailyAvgNetCO2={metrics.dailyAvgNetCO2}
              simulatedSavings={metrics.simulatedSavings}
              lifestyleChoices={lifestyleChoices}
              onChoicesChange={setLifestyleChoices}
            />
            <OffsetVault
              offsetCredits={offsetCredits}
              xpPoints={currentXP}
              onPurchase={handlePurchaseOffset}
            />
          </div>

          {/* Row 5: Audit Ledger (full width) */}
          <AuditLedger logs={logs} onDelete={handleDeleteLog} />
        </main>

        <footer className="app-footer" role="contentinfo">
          <p>EcoTrace — Helping individuals understand and reduce their carbon footprint.</p>
          <p>
            <a href="https://github.com/dimpulsowjanya-ops/eco-tracker" target="_blank" rel="noopener noreferrer" className="footer-link">
              View on GitHub
            </a>
          </p>
        </footer>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AppContext.Provider>
  );
}
