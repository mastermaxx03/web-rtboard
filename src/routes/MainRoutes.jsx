import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

const Canvas2Page = Loadable(lazy(() => import('views/canvas2/index')));
const RealtimeLayoutPage2 = Loadable(lazy(() => import('views/realtime-layout2/index')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    { path: 'canvas2', element: <Canvas2Page /> },
    { path: 'realtime-dashboard2', element: <RealtimeLayoutPage2 /> },
    { path: '*', element: <div>404 Not Found</div> } // catch-all fallback
  ]
};

export default MainRoutes;
