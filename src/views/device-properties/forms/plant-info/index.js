// src/views/plant-info/index.js
import { plantSection1Fields } from './section1';
import { plantSection2Fields } from './section2';

export const getPlantInfoSteps = () => [
  { label: 'Company Meta', fields: plantSection1Fields },
  { label: 'Ops & Tariff', fields: plantSection2Fields },
  // 👇 Preview step is a sentinel with one field of type "preview"
  { label: 'Preview', fields: [{ id: '__preview__', type: 'preview' }] }
];
