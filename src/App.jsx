import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { MachineStatusProvider } from './contexts/MachineStatusContext';

export default function App() {
  return (
    <MachineStatusProvider>
      <RouterProvider router={router} />
    </MachineStatusProvider>
  );
}
