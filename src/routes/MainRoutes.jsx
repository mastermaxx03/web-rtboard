import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import MinimalLayout from 'layout/MinimalLayout';
import Loadable from 'ui-component/Loadable';

// Lazy-loaded pages
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const Canvas2Page = Loadable(lazy(() => import('views/canvas2/index')));
const RealtimeLayoutPage2 = Loadable(lazy(() => import('views/realtime-layout2/index')));

// Main routing
const MainRoutes = [
  {
    path: '/',
    element: <MinimalLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: '', element: <LoginPage /> }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'canvas2', element: <Canvas2Page /> },
      { path: 'realtime-dashboard2', element: <RealtimeLayoutPage2 /> }
    ]
  }
];

export default MainRoutes;
