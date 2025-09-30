import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import Canvas2Page from '../views/canvas2';
import HistoricalPage from '../views/historical/HistoricalPage';
import { LLVoltagePage } from '../views/telemetry/llVoltage';
import TelemetryPage from '../views/telemetry-kit/TelemetryPage';
import { path } from 'd3';
import AlertLogPage from '../views/alerts/alertLogPage/AlertLogPage';
import EBW from '../views/ebw';
import EBWPage from '../views/ebw';
import PlantSummaryPage from '../views/plantSummary';
import TotalPages from '../views/total_pages';
import TimeWindowDemo from '../menu-items/DatePackage2/TimeWindowDemo';
import RTCostPage from '../views/realtime-layout/RT-Cost';
import PlantInfoPage from '../views/device-properties/forms/plant-info/PlantInfoPage';

// dashboard routing
const CanvasPage = Loadable(lazy(() => import('views/canvas/index.jsx')));
const Canvas2 = Loadable(lazy(() => import('views/canvas2/index.jsx')));
const RealtimeLayoutPage = Loadable(lazy(() => import('views/realtime-layout')));
const RealtimeLayoutPage2 = Loadable(lazy(() => import('views/realtime-layout2')));
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const Dashboard2 = Loadable(lazy(() => import('views/dashboard/Default')));
const Alerts = Loadable(lazy(() => import('views/alerts')));
const AiInsights = Loadable(lazy(() => import('views/ai-insights')));
const Reports = Loadable(lazy(() => import('views/reports')));
const Settings = Loadable(lazy(() => import('views/settings')));
const Connectivity = Loadable(lazy(() => import('views/connectivity')));
const Plans = Loadable(lazy(() => import('views/plans')));
const Help = Loadable(lazy(() => import('views/help')));
const MyProfile = Loadable(lazy(() => import('views/my-profile')));
const Users = Loadable(lazy(() => import('views/users')));
const ScheduleMeet = Loadable(lazy(() => import('views/schedule-meeting')));

const MonitoringDetails = Loadable(lazy(() => import('views/monitoring-details')));
const MonitoringDetailsHistory = Loadable(lazy(() => import('views/monitoring-details-history')));

const UserRoles = Loadable(lazy(() => import('views/user-roles')));
const DevicePropertiesPage = Loadable(lazy(() => import('views/device-properties')));
const PlantSummaryDashboard = Loadable(lazy(() => import('views/plantSummary/Dashboard.jsx')));

// Electricity Bill
const ElectricityBill = Loadable(lazy(() => import('views/electricity/BillWizard')));
const BillsOverview = Loadable(lazy(() => import('views/electricity/BillsOverview')));
const BillDetails = Loadable(lazy(() => import('views/electricity/BillDetails')));

// Icons
const Icons = Loadable(lazy(()=> import('views/device-properties/forms/components/Icons')))

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <Dashboard2 />
    },
    // {
    //   path: 'dashboard',
    //   children: [
    //     {
    //       path: 'default',
    //       element: <DashboardDefault />
    //     }
    //   ]
    // },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    {
      path: '/dashboard0',
      element: <DashboardDefault />
    },
    {
      path: '/dashboard',
      element: <Dashboard2 />
    },
    {
      path: 'plant-summary', // This will be your URL: /plant-summary
      element: <PlantSummaryDashboard />
    },

    { path: 'alerts', element: <Alerts /> },
    { path: 'ai-insights', element: <AiInsights /> },
    { path: 'reports', element: <Reports /> },
    { path: 'settings', element: <Settings /> },
    { path: 'connectivity', element: <Connectivity /> },
    { path: 'plans', element: <Plans /> },
    { path: 'help', element: <Help /> },
    { path: 'my-profile', element: <MyProfile /> },
    { path: 'users', element: <Users /> },
    { path: 'schedule-meet', element: <ScheduleMeet /> },

    { path: '/rtmonitoring/:machineId', element: <MonitoringDetails /> },
    { path: '/himonitoring/:machineId', element: <MonitoringDetailsHistory /> },

    { path: '/user-roles', element: <UserRoles /> },
    {
      path: '/canvas',
      element: <CanvasPage />
    },
    {
      path: '/canvas2',
      element: <Canvas2Page />
    },
    {
      path: '/canvas2/device-properties',
      element: <DevicePropertiesPage />
    },
    {
      path: '/realtime-dashboard',
      element: <RealtimeLayoutPage />
    },
    {
      path: '/realtime-dashboard2',
      element: <RealtimeLayoutPage2 />
    },
    {
      path: '/historical/:componentID',
      element: <HistoricalPage />
    },
    {
      path: '/tld',
      element: <LLVoltagePage />
    },
    { path: 'telemetry/:componentID', element: <TelemetryPage /> },
    {
      path: '/alert-log',
      element: <AlertLogPage />
    },
    {
      path: 'ebw/:componentId',
      element: <EBWPage />
    },
    {
      path: '/psw/:componentID',
      element: <PlantSummaryPage />
    },
    {
      path: '/electricity',
      element: <ElectricityBill />
    },
    {
      path: '/total-pages',
      element: <TotalPages />
    },
    {
      path: '/date-demo-pro',
      element: <TimeWindowDemo />
    },
    {
      path: '/rt-cost',
      element: <RTCostPage />
    },
    {
      path: '/plant-info-page',
      element: <PlantInfoPage />
    },
    {
      path: '/electricity-overview',
      element: <BillsOverview />
    },
    {
      path: '/electricity/:billId',
      element: <BillDetails />
    },
    {
      path: '/icons', 
      element: <Icons />
    },

  ]
};

export default MainRoutes;
