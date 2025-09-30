import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';

// project imports
import { DASHBOARD_PATH } from 'config';
import Logo from 'ui-component/Logo';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  return (
    <Link component={RouterLink} to={DASHBOARD_PATH} aria-label="theme-logo">
      {/* <Logo /> */}
      <img src="https://esm.co.in/wp-content/uploads/2025/04/esm-rotate-logo.gif" alt="" srcset="" width={'140px'} />
    </Link>
  );
}
