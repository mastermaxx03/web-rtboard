import React from 'react';
import { Cloud, Zap, TrendingUp, AlertTriangle, Image as ImageIcon, FileDown ,X} from 'lucide-react';
// Import the new CSS file
import './PanelInfoModal.css';

// ID: DB-PIM-01
export default function PanelInfoModal({data:initialData,onClose}) {
  // Data would come from props in a real app
  const data = initialData || {
    name: 'HT Panel',
    panelId: 'HT00A245',
    ratingDetails: 'Voltage Level, Rated Current, Power rating...',
    installDate: '25-07-2025',
    owner: 'Ravishankar',
    ratedCapacity: '4200 kVA',
    cloudStatus: 'Connected',
    panelStatus: 'ON',
    performance: 95,
    activeAlarms: 6,
    totalAlarms: 10
  };
  return (
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
   <div className="modal-header">
  {/* Item 1: The title */}
  <span>PANEL INFO CARD</span>
  
  {/* Item 2: The icon */}
  <X className="close-icon" size={24} onClick={onClose} />
</div>
      <div className="main-content">
        {/* Left Column */}
        <div className="left-column">
          <div className="detail-row">
            <span className="detail-label">Name of Panel</span>: <span className="detail-value">{data.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Panel ID</span>: <span className="detail-value">{data.panelId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Panel Rating Details</span>:
          </div>
          <div className="detail-row">
            <span className="detail-label">ESAI Installation Date</span>: <span className="detail-value">{data.installDate}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Panel Owner</span>: <span className="detail-value">{data.owner}</span>
          </div>

          <div className="file-uploads">
            <div className="file-box">
              <ImageIcon size={24} style={{ marginBottom: 8 }} /> Display Image*
            </div>
            <div className="file-box">
              <FileDown size={24} style={{ marginBottom: 8 }} /> Technical Specs*
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div>
            <div className="status-label">Total Rated Capacity*</div>
            <div className="large-value">{data.ratedCapacity}</div>
          </div>
          <div className="status-item">
            <Cloud size={24} color="#36a2eb" className="status-icon" />
            <div className="status-details">
              <div className="status-label">Cloud²</div>
              <div className="status-value">{data.cloudStatus}</div>
            </div>
          </div>
          <div className="status-item">
            <Zap size={24} color="#169c33" className="status-icon" />
            <div className="status-details">
              <div className="status-label">Status³</div>
              <div className="status-value">{data.panelStatus}</div>
            </div>
          </div>
          <div className="status-item">
            <TrendingUp size={24} color="#ffce56" className="status-icon" />
            <div className="status-details">
              <div className="status-label">Performance⁴</div>
              <div className="status-value">{data.performance}%</div>
              <div className="progress-bar-container">
                {/* This style must remain inline because its width is dynamic */}
                <div className="progress-bar-fill" style={{ width: `${data.performance}%` }}></div>
              </div>
            </div>
          </div>
          <div className="status-item">
            <AlertTriangle size={24} color="#ff5252" className="status-icon" />
            <div className="status-details">
              <div className="status-label">Active Alarms⁵</div>
              <div className="status-value">
                {data.activeAlarms} / {data.totalAlarms}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="modal-button modal-button-primary" onClick={onClose}>
          Okay
        </button>
        <button className="modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
