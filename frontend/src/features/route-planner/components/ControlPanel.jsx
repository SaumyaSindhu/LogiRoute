import "./ControlPanel.scss";

export default function ControlPanel({
  stopCount,
  isLoading,
  error,
  optimizedRoute,
  onOptimize,
}) {
  return (
    <aside className="control-panel">
      <header className="control-panel__header">
        <h1>LogiRoute</h1>
        <p>Rohini Delivery Planner</p>
      </header>

      <div className="control-panel__status">
        <span>
          {stopCount} stop{stopCount !== 1 ? "s" : ""} added
        </span>
      </div>

      <button
        className="control-panel__optimize-btn"
        onClick={onOptimize}
        disabled={isLoading}
      >
        {isLoading ? "Optimizing..." : "Optimize Route"}
      </button>

      {error && <div className="control-panel__error">{error}</div>}

      {optimizedRoute && (
        <div className="control-panel__result">
          <span className="control-panel__result-label">Total travel time</span>
          <span className="control-panel__result-value">
            {Math.round(optimizedRoute.total_duration_seconds / 60)} min
          </span>
        </div>
      )}

      <p className="control-panel__hint">
        Click the map to add a delivery stop.
      </p>
    </aside>
  );
}
