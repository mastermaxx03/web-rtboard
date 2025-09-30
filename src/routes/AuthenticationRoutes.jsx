import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import { red } from '@mui/material/colors';
import { Navigate } from 'react-router';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const ForgetPage = Loadable(lazy(() => import('views/pages/authentication/Forget')));
const ResetPage = Loadable(lazy(() => import('views/pages/authentication/Reset')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '',
      element: <Navigate to="/pages/login" replace />
    },
    {
      path: '/pages/login',
      element: <LoginPage />
    },
    {
      path: '/pages/forgot-password',
      element: <ForgetPage />
    },
    {
      path: '/pages/recover-password',
      element: <ResetPage />
    },
    {
      path: '/pages/register',
      element: <RegisterPage />
    }
  ]
};

export default AuthenticationRoutes;
