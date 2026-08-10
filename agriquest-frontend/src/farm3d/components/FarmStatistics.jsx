/* ═══════════════════════════════════════════════════════════════
   FarmStatistics — Live farm-wide statistics dashboard
   ═══════════════════════════════════════════════════════════════ */
import React from 'react';
import { useFarmStats } from '../simulation/farmState.jsx';

function StatCard({ icon, label, value, color, suffix = '' }) {
  return (
    <div className="farm3d-stat-card">
      <div className="farm3d-stat-card__icon">{icon}</div>
      <div className="farm3d-stat-card__data">
        <div className="farm3d-stat-card__value" style={{ color }}>{value}{suffix}</div>
        <div className="farm3d-stat-card__label">{label}</div>
      </div>
    </div>
  );
}

export default function FarmStatistics() {
  const stats = useFarmStats();

  return (
    <div className="farm3d-statistics">
      <div className="farm3d-panel-header">
        <span className="farm3d-panel-icon">📊</span>
        <h3 className="farm3d-panel-title">Farm Stats</h3>
      </div>

      <div className="farm3d-stat-grid">
        <StatCard
          icon="🗺️"
          label="Total Plots"
          value={stats.totalPlots}
          color="#90caf9"
        />
        <StatCard
          icon="🌱"
          label="Planted"
          value={stats.plantedPlots}
          color="#66bb6a"
        />
        <StatCard
          icon="💚"
          label="Healthy"
          value={stats.healthyCrops}
          color="#4caf50"
        />
        <StatCard
          icon="💧"
          label="Avg Moisture"
          value={stats.avgMoisture}
          color="#42a5f5"
          suffix="%"
        />
        <StatCard
          icon="🌍"
          label="Soil Quality"
          value={stats.qualityLabel.label}
          color={stats.qualityLabel.color}
        />
        <StatCard
          icon="📦"
          label="Expected Yield"
          value={stats.expectedYield}
          color="#ffa726"
        />
        <StatCard
          icon="🌾"
          label="Harvest Ready"
          value={stats.harvestReady}
          color="#ffd54f"
        />
        <StatCard
          icon="🏆"
          label="Total Harvested"
          value={stats.totalHarvested}
          color="#ab47bc"
        />
        <StatCard
          icon="💰"
          label="Farm Profit"
          value={`$${stats.totalProfit}`}
          color="#66bb6a"
        />
      </div>
    </div>
  );
}
