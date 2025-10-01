import { createBrowserRouter } from 'react-router-dom';
import routes from './index';

const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_APP_BASE_NAME || '/'
});

export default router;
