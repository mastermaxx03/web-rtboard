import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import { Navigate } from 'react-router-dom';

const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const ForgetPage = Loadable(lazy(() => import('views/pages/authentication/Forget')));
const ResetPage = Loadable(lazy(() => import('views/pages/authentication/Reset')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    { path: '', element: <Navigate to="login" replace /> },
    { path: 'login', element: <LoginPage /> },
    { path: 'forgot-password', element: <ForgetPage /> },
    { path: 'recover-password', element: <ResetPage /> },
    { path: 'register', element: <RegisterPage /> }
  ]
};

export default AuthenticationRoutes;
