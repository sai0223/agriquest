/* ═══════════════════════════════════════════════════════════════
   VirtualFarmPage — 3D Interactive Farm Simulation
   With tool modes, farmer character, and interactive actions
   ═══════════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { FarmStateProvider, useFarmState } from '../farm3d/simulation/farmState.jsx';
import { useGrowthSimulation } from '../farm3d/simulation/cropGrowth.js';
import FarmScene from '../farm3d/components/FarmScene.jsx';
import CropSelector from '../farm3d/components/CropSelector.jsx';
import FarmControls from '../farm3d/components/FarmControls.jsx';
import PlotInfo from '../farm3d/components/PlotInfo.jsx';
import FarmStatistics from '../farm3d/components/FarmStatistics.jsx';

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

/* ─── Toolbar with tool mode indicator ────────────────────── */
function Toolbar() {
  const { state, actions } = useFarmState();

  return (
    <div className="farm3d-toolbar">
      <div className="farm3d-toolbar__left">
        <span className="farm3d-toolbar__title">🌾 3D Virtual Farm</span>
        <span className="farm3d-toolbar__badge">Interactive Simulation</span>
      </div>
      <div className="farm3d-toolbar__right">
        {state.activeToolMode ? (
          <div className="farm3d-toolbar__tool-active">
            <span className="farm3d-toolbar__tool-icon">
              {state.activeToolMode === 'water' ? '💧' : '🧪'}
            </span>
            <span className="farm3d-toolbar__tool-label">
              {state.activeToolMode === 'water' ? 'Water Tool' : 'Fertilizer Tool'}
            </span>
            <button
              className="farm3d-toolbar__tool-cancel"
              onClick={() => actions.setToolMode(null)}
              title="Cancel tool"
            >
              ✕
            </button>
          </div>
        ) : state.farmerState.isMoving || state.farmerState.isPerformingAction ? (
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

  return (
    <div className="farm3d-bottom-bar">
      <span className="farm3d-bottom-bar__item">
        🗺️ Plots: <strong>{Object.values(state.plots).filter(p => p.cropId).length}/{Object.keys(state.plots).length}</strong>
      </span>
      {selectedPlot && (
        <span className="farm3d-bottom-bar__item">
          📍 Selected: <strong className="text-green">{selectedPlot.id}</strong>
        </span>
      )}
      {state.selectedCropId && (
        <span className="farm3d-bottom-bar__item">
          🌱 Planting: <strong className="text-amber">{state.selectedCropId}</strong>
        </span>
      )}
      {state.activeToolMode && (
        <span className="farm3d-bottom-bar__item">
          🔧 Tool: <strong className="text-sky">{state.activeToolMode}</strong>
        </span>
      )}
      {state.farmerState.isPerformingAction && (
        <span className="farm3d-bottom-bar__item">
          🌾 Farmer: <strong className="text-amber">{state.farmerState.action}ing ({state.farmerState.actionProgress}%)</strong>
        </span>
      )}
      <span className="farm3d-bottom-bar__item">
        ⚡ Speed: <strong>{state.growthSpeed}x</strong>
      </span>
      <span className="farm3d-bottom-bar__item">
        💰 Profit: <strong className="text-green">${state.totalProfit}</strong>
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
