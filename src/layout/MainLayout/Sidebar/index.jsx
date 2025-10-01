import { Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useGetMenuMaster } from 'api/menu';

const drawerWidth = 240;

export default function Sidebar() {
  const { menuMaster } = useGetMenuMaster();
  const open = menuMaster?.isDashboardDrawerOpened;

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box'
        }
      }}
    >
      <List>
        <NavLink to="/canvas2" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton selected={menuMaster.openedItem === 'canvas2'}>
            <ListItemText primary="Plant Layout" />
          </ListItemButton>
        </NavLink>
        {/* <NavLink to="/realtime-dashboard2" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton selected={menuMaster.openedItem === 'realtime-dashboard2'}>
            <ListItemText primary="Real-time Dashboard" />
          </ListItemButton>
        </NavLink> */}
      </List>
    </Drawer>
  );
}
