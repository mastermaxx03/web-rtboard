import { RouterProvider } from 'react-router-dom';
import router from 'routes'; // pared-down router with only login, canvas2, realtime-dashboard2
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes'; // keep if styling is still needed
import useOfflineLock from 'hooks/useOfflineLock'; // keep if offline lock still desired

// toast (remove if not used in your three pages)
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ToastOutsideRoot from 'ui/ToastOutsideRoot';

export default function App() {
  // retain offline lock if Canvas2 or Dashboard requires it
  useOfflineLock();

  return (
    <ThemeCustomization>
      <NavigationScroll>
        <RouterProvider router={router} />
        <ToastContainer autoClose={2500} />
        <ToastOutsideRoot />
      </NavigationScroll>
    </ThemeCustomization>
  );
}
