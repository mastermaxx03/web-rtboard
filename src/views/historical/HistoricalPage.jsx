import React from 'react';
import { useParams } from 'react-router-dom';

import RTW3H from '../../ui-component/historical/RTW3-H'; // animesh
import RTW6H from '../../ui-component/historical/RTW6-H'; // pratik
import RTW7H from '../../ui-component/historical/RTW7-H'; // pratik
import RTW2H from '../../ui-component/historical/RTW2-H'; // animesh
import RTW5H from '../../ui-component/historical/RTW5-H'; // animesh
import RTW13H from '../../ui-component/historical/RTW13-H'; // animesh
import RTW11H from '../../ui-component/historical/RTW11-H'; // animesh
// import RTW4H from '../../ui-component/historical/RTW4-H'; // rohit
import RTW8H from '../../ui-component/historical/RTW8-H'; // pratik
import RTW15H from '../../ui-component/historical/RTW15-H';
import RTW4H from '../../ui-component/historical/RTW4-H/index';

export default function HistoricalPage() {
  const { componentID } = useParams();
  switch (componentID) {
    default:
      return null;
    case 'RTW3H':
      return <RTW3H />;
    case 'RTW4H':
      return <RTW4H />;
    case 'RTW6H':
      return <RTW6H />;
    case 'RTW7H':
      return <RTW7H />;
    case 'RTW2H':
      return <RTW2H />;
    case 'RTW5H':
      return <RTW5H />;
    case 'RTW13H':
      return <RTW13H />;
    case 'RTW11H':
      return <RTW11H />;
    case 'RTW8H':
      return <RTW8H />;
    case 'RTW15H':
      return <RTW15H />;
  }
}
