// assets
import { IconDashboard } from '@tabler/icons-react';

// constant
const icons = { IconDashboard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: '',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    // {
    //   id: 'default',
    //   title: 'Realtime Data',
    //   type: 'item',
    //   url: '/realtime-dashboard2',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    {
      id: 'canvas2',
      title: 'Plant Layout',
      type: 'item',
      url: '/canvas2',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },

    // {
    //   id: 'default',
    //   title: 'AI Insights',
    //   type: 'item',
    //   url: '/ai-insights',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    {
      id: 'default',
      title: 'Reports',
      type: 'item',
      url: '/reports',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    // {
    //   id: 'default',
    //   title: 'Settings/Configuration',
    //   type: 'item',
    //   url: '/settings',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'default',
    //   title: 'Connectivity',
    //   type: 'item',
    //   url: '/connectivity',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    {
      id: 'default',
      title: 'Plan & Subscription',
      type: 'item',
      url: '/plans',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'default',
      title: 'Help & Support',
      type: 'item',
      url: '/help',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    // {
    //   id: 'default',
    //   title: 'My Profile',
    //   type: 'item',
    //   url: '/my-profile',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'default',
    //   title: 'Users',
    //   type: 'item',
    //   url: '/users',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'default',
    //   title: 'Schudule Meetings',
    //   type: 'item',
    //   url: '/schedule-meet',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    // {
    //   id: 'default',
    //   title: 'User Roles',
    //   type: 'item',
    //   url: '/user-roles',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false
    // },
    {
      id: 'default',
      title: 'Pages',
      type: 'item',
      url: '/total-pages',
      icon: icons.IconDashboard,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
