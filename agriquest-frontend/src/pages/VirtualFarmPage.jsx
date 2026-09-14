/* ═══════════════════════════════════════════════════════════════
   VirtualFarmPage — 3D Interactive Farm Simulation
   With realistic crop-specific farming workflows
   ═══════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { FarmStateProvider, useFarmState } from '../farm3d/simulation/farmState.jsx';
import { useGrowthSimulation } from '../farm3d/simulation/cropGrowth.js';
import FarmScene from '../farm3d/components/FarmScene.jsx';
import CropSelector from '../farm3d/components/CropSelector.jsx';
import FarmControls from '../farm3d/components/FarmControls.jsx';
import PlotInfo from '../farm3d/components/PlotInfo.jsx';
import FarmStatistics from '../farm3d/components/FarmStatistics.jsx';
import { getCropById } from '../farm3d/data/cropData.js';

/* ─── Notification Toast ──────────────────────────────────── */
function NotificationToasts() {
  const { state, actions } = useFarmState();
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (state.notifications.length > 0) {
      setVisible(state.notifications.slice(-3));
    }
  }, [state.notifications]);

  useEffect(() => {
    if (visible.length === 0) return;
    const timer = setTimeout(() => {
      setVisible([]);
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (visible.length === 0) return null;

  return (
    <div className="farm3d-toasts">
      {visible.map(n => (
        <div key={n.id} className={`farm3d-toast farm3d-toast--${n.type}`}>
          <span>{n.message}</span>
          <button onClick={() => actions.dismissNotification(n.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

/* ─── Left Sidebar (Crops + Controls) ─────────────────────── */
function LeftPanel() {
  const [activeTab, setActiveTab] = useState('crops');

  return (
    <div className="farm3d-sidebar farm3d-sidebar--left">
      <div className="farm3d-sidebar__tabs">
        <button
          className={`farm3d-sidebar__tab${activeTab === 'crops' ? ' active' : ''}`}
          onClick={() => setActiveTab('crops')}
        >
          🌱 Crops
        </button>
        <button
          className={`farm3d-sidebar__tab${activeTab === 'actions' ? ' active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          🛠️ Actions
        </button>
      </div>

      <div className="farm3d-sidebar__content">
        {activeTab === 'crops' && <CropSelector />}
        {activeTab === 'actions' && <FarmControls />}
      </div>
    </div>
  );
}

/* ─── Right Sidebar (Plot Info + Stats) ───────────────────── */
function RightPanel() {
  return (
    <div className="farm3d-sidebar farm3d-sidebar--right">
      <div className="farm3d-sidebar__scroll">
        <PlotInfo />
        <FarmStatistics />
      </div>
    </div>
  );
}

/* ─── Inner Farm Layout (needs state context) ─────────────── */
function FarmLayout() {
  useGrowthSimulation();

  return (
    <div className="farm3d-studio">
      <LeftPanel />

      <div className="farm3d-center">
        {/* Toolbar */}
        <Toolbar />

        {/* 3D Scene */}
        <FarmScene />

        {/* Bottom Status Bar */}
        <BottomBar />
      </div>

      <RightPanel />

      <NotificationToasts />
    </div>
  );
}

/* ─── Toolbar with borewell indicator ─────────────────────── */
function Toolbar() {
  const { state, actions } = useFarmState();

  return (
    <div className="farm3d-toolbar">
      <div className="farm3d-toolbar__left">
        <span className="farm3d-toolbar__title">🌾 Virtual Farm</span>
        <span className="farm3d-toolbar__badge">Realistic Simulation</span>
      </div>
      <div className="farm3d-toolbar__right">
        {/* Borewell status indicator */}
        <div
          className={`farm3d-toolbar__borewell ${state.borewellActive ? 'active' : ''}`}
          onClick={() => actions.toggleBorewell()}
          title="Toggle Borewell"
        >
          <span>🚰</span>
          <span>{state.borewellActive ? 'ON' : 'OFF'}</span>
        </div>

        {state.farmerState.isMoving || state.farmerState.isPerformingAction ? (
          <span className="farm3d-toolbar__hint farm3d-toolbar__hint--farmer">
            🚶 Farmer {state.farmerState.isMoving ? 'walking' : 'working'}...
          </span>
        ) : (
          <span className="farm3d-toolbar__hint">🖱️ Orbit · 🔍 Zoom · ✋ Pan</span>
        )}
      </div>
    </div>
  );
}

/* ─── Bottom Status Bar ───────────────────────────────────── */
function BottomBar() {
  const { state } = useFarmState();
  const selectedPlot = state.selectedPlotId ? state.plots[state.selectedPlotId] : null;
  const crop = selectedPlot?.cropId ? getCropById(selectedPlot.cropId) : null;

  return (
    <div className="farm3d-bottom-bar">
      <span className="farm3d-bottom-bar__item">
        🗺️ Plots: <strong>{Object.values(state.plots).filter(p => p.cropId).length}/{Object.keys(state.plots).length}</strong>
      </span>
      {selectedPlot && (
        <span className="farm3d-bottom-bar__item">
          📍 <strong className="text-green">{selectedPlot.id}</strong>
        </span>
      )}
      {crop && (
        <span className="farm3d-bottom-bar__item">
          {crop.icon} <strong className="text-amber">{crop.name}</strong>
          <span style={{ marginLeft: 4, fontSize: '0.7rem', opacity: 0.7 }}>
            Step {selectedPlot.farmingStepIndex + 1}/{crop.farmingSteps.length}
          </span>
        </span>
      )}
      <span className="farm3d-bottom-bar__item">
        🚰 <strong className={state.borewellActive ? 'text-sky' : 'text-danger'}>{state.borewellActive ? 'ON' : 'OFF'}</strong>
      </span>
      <span className="farm3d-bottom-bar__item">
        ⚡ <strong>{state.growthSpeed}x</strong>
      </span>
      <span className="farm3d-bottom-bar__item">
        💰 <strong className="text-green">₹{state.totalProfit}</strong>
      </span>
    </div>
  );
}

/* ─── Exported Page Component ─────────────────────────────── */
export default function VirtualFarmPage() {
  return (
    <FarmStateProvider>
      <FarmLayout />
    </FarmStateProvider>
  );
}
