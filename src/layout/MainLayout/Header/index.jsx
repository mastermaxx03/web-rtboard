import { IconButton, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { handlerDrawerOpen } from 'api/menu';

export default function Header() {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {/* Drawer toggle */}
      <IconButton edge="start" color="inherit" onClick={() => handlerDrawerOpen()} sx={{ mr: 2, display: { md: 'none' } }}>
        <MenuIcon />
      </IconButton>

      {/* App title or logo text */}
      <Typography variant="h6" noWrap component="div">
        RTBoard
      </Typography>
    </div>
  );
}
