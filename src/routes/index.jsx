import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import MainLayout from 'layout/MainLayout';
import AuthGuard from './AuthGuard';
import { Navigate } from 'react-router-dom';

// Lazy-loaded pages
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const ForgetPage = Loadable(lazy(() => import('views/pages/authentication/Forget')));
const ResetPage = Loadable(lazy(() => import('views/pages/authentication/Reset')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));
const Canvas2Page = Loadable(lazy(() => import('views/canvas2/index')));
const RealtimeLayoutPage2 = Loadable(lazy(() => import('views/realtime-layout2/index')));

const routes = [
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { path: '', element: <Navigate to="canvas2" replace /> },
      { path: 'canvas2', element: <Canvas2Page /> },
      { path: 'realtime-dashboard2', element: <RealtimeLayoutPage2 /> },
      { path: '*', element: <div>404 Not Found</div> }
    ]
  },
  {
    path: '/',
    element: <MinimalLayout />,
    children: [
      { path: '', element: <Navigate to="login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgetPage /> },
      { path: 'recover-password', element: <ResetPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  }
];

export default routes;
