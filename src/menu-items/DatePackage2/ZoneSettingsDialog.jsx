import React from 'react';
import UnifiedSettingsDialog from './UnifiedSettingsDialog';

export default function ZoneSettingsDialog({ open, onClose }) {
  return <UnifiedSettingsDialog open={open} onClose={onClose} initialPane="zones" />;
}
