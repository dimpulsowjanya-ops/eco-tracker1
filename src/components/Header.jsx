import React from 'react';
import { Leaf, Award, Compass, Moon, Sun, RefreshCw, Download, Upload } from 'lucide-react';
import { REGIONAL_GRIDS } from '../constants/carbonFactors.js';

/**
 * Application header with navigation controls and gamification stats.
 *
 * @param {{ darkMode, onToggleDark, selectedGrid, onGridChange, ecoTier, userLevel, xpPoints, onReset, onExportCSV, onExportJSON, onImportJSON }} props
 */
export function Header({
  darkMode,
  onToggleDark,
  selectedGrid,
  onGridChange,
  ecoTier,
  userLevel,
  xpPoints,
  onReset,
  onExportCSV,
  onExportJSON,
  onImportJSON
}) {
  return (
    <header role="banner" className="header">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="header__brand">
        <Leaf size={28} className="brand-logo" aria-hidden="true" />
        <div>
          <h1 className="header__title">EcoTrace</h1>
          <p className="header__subtitle">Personal Carbon Footprint Tracker</p>
        </div>
      </div>

      <nav className="header__controls" aria-label="App controls">
        {/* User Level and Progress Bar */}
        {userLevel && (
          <div className="level-container" aria-label={`Level ${userLevel.num}: ${userLevel.name}`}>
            <div className="level-info">
              <span className="level-badge-title">
                <Award size={14} className="level-icon" /> {userLevel.title}
              </span>
              {userLevel.xpToNext > 0 ? (
                <span className="xp-remaining">{userLevel.xpToNext} XP to Lvl {userLevel.num + 1}</span>
              ) : (
                <span className="xp-remaining">Max Level</span>
              )}
            </div>
            <div className="level-bar-track" title={`${userLevel.levelProgress}% progress to next level`}>
              <div className="level-bar-fill" style={{ width: `${userLevel.levelProgress}%` }} />
            </div>
          </div>
        )}

        {/* Eco Tier Badge */}
        <div
          className="tier-badge-container"
          style={{ background: ecoTier.color + '18', color: ecoTier.color, border: `1px solid ${ecoTier.color}33` }}
          aria-label={`Eco tier: ${ecoTier.name}`}
        >
          <span aria-hidden="true" className="tier-badge-emoji">{ecoTier.emoji}</span>
          <span className="tier-badge-text">{ecoTier.name}</span>
        </div>

        {/* Current XP Points (Spent currency) */}
        <div className="xp-coin-badge" aria-label={`${xpPoints} carbon coins available`}>
          🪙 {xpPoints} Coins
        </div>

        {/* Grid Selector */}
        <div className="header__control-group">
          <label htmlFor="grid-select" className="sr-only">Select grid region</label>
          <select
            id="grid-select"
            value={selectedGrid}
            onChange={e => onGridChange(e.target.value)}
            className="header__select"
            aria-label="Electricity grid region"
          >
            {Object.entries(REGIONAL_GRIDS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <button
          id="dark-mode-toggle"
          onClick={onToggleDark}
          className="btn btn--icon"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={darkMode}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Import/Export Menu */}
        <div className="header__control-group">
          <label
            htmlFor="import-file"
            className="btn btn--secondary"
            style={{ cursor: 'pointer' }}
            title="Import JSON data file"
          >
            <Upload size={14} /> Import
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={onImportJSON}
              className="sr-only"
              aria-label="Import data from JSON"
            />
          </label>
          <button id="export-csv-btn" onClick={onExportCSV} className="btn btn--secondary" aria-label="Export CSV" title="Export CSV data"><Download size={14} /> CSV</button>
          <button id="export-json-btn" onClick={onExportJSON} className="btn btn--secondary" aria-label="Export JSON" title="Export JSON data"><Download size={14} /> JSON</button>
        </div>

        {/* Reset */}
        <button
          id="reset-btn"
          onClick={onReset}
          className="btn btn--danger"
          aria-label="Reset all data"
          title="Reset application data"
        >
          <RefreshCw size={14} /> Reset
        </button>
      </nav>
    </header>
  );
}
