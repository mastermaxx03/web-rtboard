import React from 'react';
import UnifiedSettingsDialog from './UnifiedSettingsDialog';

export default function ShiftSettingsDialog({ open, onClose }) {
  return <UnifiedSettingsDialog open={open} onClose={onClose} initialPane="shifts" />;
}
