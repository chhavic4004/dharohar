import React from "react";

export default function PartitionToggle({ checked, onChange, label }) {
  return (
    <div className="partition-toggle">
      <span className="partition-toggle__label">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch ${checked ? "switch--on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  );
}
