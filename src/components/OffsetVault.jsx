import React from 'react';
import { OFFSET_PROJECTS } from '../constants/carbonFactors.js';

/**
 * Offset Vault — allows users to trade XP coins to purchase carbon offset credits.
 *
 * @param {{ offsetCredits: number, xpPoints: number, onPurchase: Function }} props
 */
export function OffsetVault({ offsetCredits, xpPoints, onPurchase }) {
  return (
    <section aria-labelledby="offset-heading" className="card offset-vault-card">
      <div className="card__header">
        <h2 id="offset-heading" className="card__title">
          <span aria-hidden="true">🌲</span> Carbon Offset Vault
        </h2>
        <div className="offset-balance-tag" aria-label={`Total offset: ${offsetCredits.toFixed(1)} kg`}>
          Net Offset: <strong>{offsetCredits.toFixed(1)} kg</strong>
        </div>
      </div>
      <p className="card__desc">
        Trade your green habit experience coins to support certified environmental projects and directly reduce your footprint.
      </p>

      <div className="offset-projects-list">
        {OFFSET_PROJECTS.map(proj => {
          const canAfford = xpPoints >= proj.cost;
          return (
            <article key={proj.id} className="offset-project-card" aria-label={`${proj.name} project`}>
              <div className="offset-project-header">
                <span className="offset-project-icon" aria-hidden="true">{proj.icon}</span>
                <div className="offset-project-meta">
                  <h3 className="offset-project-name">{proj.name}</h3>
                  <p className="offset-project-effect">−{proj.co2.toFixed(1)} kg CO₂e offset</p>
                </div>
              </div>
              <p className="offset-project-desc">{proj.description}</p>
              <div className="offset-project-footer">
                <span className="offset-project-cost">🪙 {proj.cost} Coins</span>
                <button
                  id={`purchase-offset-btn-${proj.id}`}
                  onClick={() => onPurchase(proj.id)}
                  disabled={!canAfford}
                  className={`btn btn--success btn--small ${!canAfford ? 'btn--disabled' : ''}`}
                  aria-label={canAfford ? `Purchase ${proj.name} for ${proj.cost} coins` : `Need ${proj.cost - xpPoints} more coins for ${proj.name}`}
                  aria-disabled={!canAfford}
                >
                  {canAfford ? 'Redeem Coins' : `Need ${proj.cost - xpPoints} Coins`}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
