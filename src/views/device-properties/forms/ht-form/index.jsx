// This file acts as the main "blueprint" for the HT form.
// Its only job is to import all the sections and assemble them.

import { section1Fields } from './section1';
import { section2Fields } from './section2';
import { section3Fields } from './section3';
import { section4Fields } from './section4';
import { section5Fields } from './section5';
import { section6Fields } from './section6';
import { section7Fields } from './section7';
import { section8Fields } from './section8';
import { section9Fields } from './section9';
import { section10Fields } from './section10';
import { section11Fields } from './section11';


// the final structure of our multi-step form here.
export const getHtFormSteps = (onPfInfoClick) => [
  {  fields: section1Fields },
  {  fields: section2Fields },
  { fields: section3Fields },
  {  fields: section4Fields },
  { fields: section5Fields },
  { fields: section6Fields }, //
  { fields: section7Fields }, //done
  { fields: section8Fields }, //done
  { fields: section9Fields }, //done
  { fields: section10Fields }, //done
  { fields: section11Fields }
];
