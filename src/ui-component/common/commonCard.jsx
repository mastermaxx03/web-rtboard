// src/components/Card.js
import React from 'react';
// Make sure this path is correct

export default function Card({ title, headerControls, children, className }) {
  return (
    <div className={`card ${className || ''}`}>
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div className="card-controls">{headerControls}</div>
      </div>
      <div className="card-content">{children}</div>
    </div>
  );
}
