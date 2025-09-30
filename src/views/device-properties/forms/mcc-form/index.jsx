// forms/mcc-form/index.js
import { mccSection1Fields } from './section1';
import { mccSection2Fields } from './section2';
import { mccSection3Fields } from './section3';
import { mccSection4Fields } from './section4';
import { mccSection5Fields } from './section5';
import { mccSection6Fields } from './section6';
import { mccSection7Fields } from './section7';
import { mccsectionAckFields } from './sectionAck';
import { mccSectionAuditFields } from './sectionaudit';
import { mccSectionPFFields} from './sectionpf';

export const getMccFormSteps = (_onPfInfoClick) => [
  { label: 'Machine Info', fields: mccSection1Fields },
  { label: 'Input & Protection', fields: mccSection2Fields },
  { label: 'Current Settings', fields: mccSection3Fields },
  { label: 'Power Monitoring', fields: mccSection4Fields },
  { label: 'Energy', fields: mccSection5Fields },
  { label: 'Power Factor', fields: mccSectionPFFields},
  { label: 'Harmonics (THD)', fields: mccSection6Fields },
  { label: 'Audit Info', fields: mccSectionAuditFields },
  { label: 'Maintenance & General', fields: mccSection7Fields },
  { label: 'Acknowledge', fields: mccsectionAckFields},

  // NEW: Preview step (single sentinel field)
  { label: 'Preview', fields: [{ id: '__preview__', type: 'preview' }] }
];
