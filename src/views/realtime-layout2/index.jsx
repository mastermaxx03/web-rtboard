import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Maximize, Minimize } from 'lucide-react';
import './style.css';
import axios from 'axios';
import SegmentedControl from '../../ui-component/common/SegmentedControl';
// Import all your segment components
import PanelInfoSegment from '../../ui-component/rtmlayout/PanelInfoCard/PanelInfoSegment';
import VoltageSegment from '../../ui-component/rtmlayout/ThreePhaseVoltage/VoltageSegmentY';
//import StatusBarWidget from '../../ui-component/rtmlayout/ThreePhaseVoltage/StatusBarWidget';
import VoltageLNSegment from '../../ui-component/rtmlayout/ThreePhaseVoltageL-N/VoltageLNSegmentY';
import FrequencySegment from '../../ui-component/rtmlayout/SystemFrequency/FrequencySegment';
import RealtimeCost from '../../ui-component/rtmlayout/RealtimeCost';
import ImbalanceSegment from '../../ui-component/rtmlayout/Imbalance/ImbalanceSegment';
import AvgPFSegment from '../../ui-component/rtmlayout/PowerFactor/AvgPFSegment';
import PowerConsumptionSegment from '../../ui-component/rtmlayout/PowerConsumption/PowerConsumptionSegment';
import TotalPowerSegment from '../../ui-component/rtmlayout/TotalPowerConsumption/TotalPowerSegmentX';
import MaxDemandSegment from '../../ui-component/rtmlayout/MaxDemand/MaxDemandSegment';
import EnergyConsumptionSegment from '../../ui-component/rtmlayout/EConsumption/EnergyConsumptionSegment';
import LoadSegment from '../../ui-component/rtmlayout/RTLoad/LoadSegment';
import THDVSegment from '../../ui-component/rtmlayout/Harmonics/THDVSegment';
import THDISegment from '../../ui-component/rtmlayout/Harmonics/THDISegment';
import PerformanceSegment from '../../ui-component/rtmlayout/PerformanceScore/PerformanceSegment';
import CurrentCompSegment from '../../ui-component/rtmlayout/ThreeCurrentComposition/CurrentCompSegmentX';
//1. modal views import
import PanelInfoModal from '../../ui-component/rtmlayout/PanelInfoCard/PanelInfoModal';
import VoltageModal from '../../ui-component/rtmlayout/ThreePhaseVoltage/VoltageModal';
import VoltageLNModal from '../../ui-component/rtmlayout/ThreePhaseVoltageL-N/VoltageLNModal';
//import CurrentCompModal from '../../ui-component/rtmlayout/ThreeCurrentComposition/CurrentCompModal';
import CurrentBarChartModal from '../../ui-component/rtmlayout/ThreeCurrentComposition/CurrentBarChartModal'; // Adjust path if needed
import FrequencyModal from '../../ui-component/rtmlayout/SystemFrequency/FrequencyModal';
import AvgPFModal from '../../ui-component/rtmlayout/PowerFactor/AvgPFModal';
import EnergyConsumptionModal from '../../ui-component/rtmlayout/EConsumption/EnergyConsumptionModal';
import PowerConsumptionModal from '../../ui-component/rtmlayout/PowerConsumption/PowerConsumptionModal';
import TotalPowerConsumptionModal from '../../ui-component/rtmlayout/TotalPowerConsumption/TotalPowerConsumptionModal';
import HarmonicsModal from '../../ui-component/rtmlayout/Harmonics/HarmonicsModal';
import RTLoadModal from '../../ui-component/rtmlayout/RTLoad/RTLoadModalZ';
const SOCKET_URL = 'http://192.168.1.39:9002';
import { useLocation } from 'react-router-dom';
import { segmentCardStyle } from '../../styles/commonStyles';

const styles = {
  pageWrapper: {
    position: 'relative',
    width: '100%',

    background: '#f4f6f8',
    overflow: 'hidden'
  },
  // The scrollable container for the dashboard grid
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    alignItems: 'stretch',
    padding: '14px',

    overflowX: 'auto',
    flexWrap: 'nowrap'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minHeight: '250px'
  },
  // The button is now positioned relative to the pageWrapper
  fullscreenButton: {
    position: 'absolute',
    top: '1px',
    right: '1px',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100
  },
  //2.modal styling
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999999
  },
  cardStyle: {
    backgroundColor: '#FFFFFF',
    padding: '0.5rem',
    borderRadius: '0.75rem',

    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  cardTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1E293B'
  },
  cardControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  expandIcon: {
    cursor: 'pointer',
    color: '#64748B'
  }
};
// --- Helper function to generate random data for simulation ---
const generateRandomData = () => {
  const randomBetween = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);
  const getRandomValueInRanges = (ranges) => {
    const statusKeys = Object.keys(ranges);
    const randomStatus = statusKeys[Math.floor(Math.random() * statusKeys.length)];
    const range = ranges[randomStatus];
    if (Array.isArray(range[0])) {
      // Handle split ranges like for avg freq warning
      const chosenRange = range[Math.floor(Math.random() * range.length)];
      return randomBetween(chosenRange[0], chosenRange[1]);
    }
    return randomBetween(range[0], range[1]);
  };
  // Logic to guarantee one voltage value in each range
  const nominal = 400;
  const acceptableUpper = nominal * 1.1; // 440V
  const acceptableLower = nominal * 0.9; // 360V
  const warningUpper = nominal * 1.2; // 480V
  const warningLower = nominal * 0.8; // 320V

  const acceptableValue = randomBetween(acceptableLower, acceptableUpper);
  const warningValue =
    Math.random() > 0.5
      ? randomBetween(acceptableUpper, warningUpper) // Upper warning
      : randomBetween(warningLower, acceptableLower); // Lower warning
  const criticalValue =
    Math.random() > 0.5
      ? randomBetween(warningUpper, warningUpper + 50) // Upper critical
      : randomBetween(warningLower - 50, warningLower); // Lower critical

  let voltageValues = [acceptableValue, warningValue, criticalValue].sort(() => Math.random() - 0.5);
  const phaseNames = ['VRY', 'VYB', 'VBR'];
  const formattedVoltageDataForWidget = phaseNames.map((name, index) => ({
    name: name,
    value: voltageValues[index]
  }));
  const nominalLN = 230;
  const acceptableUpperLN = nominalLN * 1.1;
  const acceptableLowerLN = nominalLN * 0.9;
  const warningUpperLN = nominalLN * 1.2;
  const warningLowerLN = nominalLN * 0.8;
  const acceptableValueLN = randomBetween(acceptableLowerLN, acceptableUpperLN);

  const warningValueLN =
    Math.random() > 0.5 ? randomBetween(acceptableUpperLN, warningUpperLN) : randomBetween(warningLowerLN, acceptableLowerLN);
  const criticalValueLN =
    Math.random() > 0.5 ? randomBetween(warningUpperLN, warningUpperLN + 30) : randomBetween(warningLowerLN - 30, warningLowerLN);
  let voltageValuesLN = [acceptableValueLN, warningValueLN, criticalValueLN].sort(() => Math.random() - 0.5);
  const freqData = {
    min: getRandomValueInRanges({ critical: [35, 40], warning: [40, 45], acceptable: [45, 50] }),
    max: getRandomValueInRanges({ acceptable: [50, 55], warning: [55, 60], critical: [60, 65] }),
    avg: getRandomValueInRanges({
      critical: [
        [40, 45],
        [55, 60]
      ],
      warning: [
        [45, 48],
        [53, 55]
      ],
      acceptable: [48, 53]
    })
  };
  const pfValues = {
    r: randomBetween(0.8, 1.0),
    y: randomBetween(0.8, 1.0),
    b: randomBetween(0.8, 1.0)
  };
  let avgPF = (pfValues.r + pfValues.y + pfValues.b) / 3;
  //powerconsmption
  const powerConsumptionPhases = {
    kw: [randomBetween(100, 150), randomBetween(100, 150), randomBetween(100, 150)],
    kva: [randomBetween(120, 170), randomBetween(120, 170), randomBetween(120, 170)],
    kvar: [randomBetween(20, 50), randomBetween(20, 50), randomBetween(20, 50)]
  };
  //tpower
  const totalPowerData = {
    kva: randomBetween(150, 180),
    kw: randomBetween(120, 140),
    kvar: randomBetween(40, 60)
  };
  const maxDemandData = {
    kva: randomBetween(180, 200),
    kw: randomBetween(150, 170),
    kvar: randomBetween(50, 70)
  };
  //harmonics
  const thdVPercentage = randomBetween(2, 8);
  const thdIPercentage = randomBetween(3, 10);
  //Rtload
  const ratedLoad = 2500;
  const realtimeLoad = +(ratedLoad * randomBetween(0.7, 0.95)).toFixed(2);
  const rtLoadPercentage = +((realtimeLoad / ratedLoad) * 100).toFixed(2);

  const performanceScoreValue = randomBetween(80, 95);
  const peakDemand = +(realtimeLoad * randomBetween(1.05, 1.2)).toFixed(2);

  const avgPower = +(peakDemand * randomBetween(0.3, 0.8)).toFixed(2);

  return {
    panelInfo: {
      // name: 'HT Panel',
      // panelId: 'HT00A245',
      // ratingDetails: 'Voltage Level, Rated Current, Power rating...',
      // installDate: '25-07-2025',
      // owner: 'Ravishankar',
      // ratedCapacity: '4200 kVA',
      // cloudStatus: 'Connected',
      // panelStatus: 'ON',
      name: 'HT Panel',
      panelId: 'HT00A245',
      ratingDetails: 'Voltage Level, Rated Current, Power rating...',
      installDate: '25-07-2025',
      owner: 'Ravishankar',
      ratedCapacity: '4200 kVA',
      cloudStatus: 'Connected',
      panelStatus: 'ON',
      performance: randomBetween(85, 99),
      activeAlarms: Math.floor(randomBetween(0, 10)),
      totalAlarms: 10
    },
    threePhaseVoltage: {
      title: '3 PHASE VOLTAGE L-L',
      ref: 10,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      phasorVolts: voltageValues,
      phasorTable: [
        { label: 'VRY', value: `${voltageValues[0]}V` },
        { label: 'VYB', value: `${voltageValues[1]}V` },
        { label: 'VBR', value: `${voltageValues[2]}V` }
      ],
      imbalanceMetrics: [
        { label: 'Max Dev', value: `${randomBetween(5, 10)}V`, percentage: randomBetween(70, 90), color: '#ff5252' },
        { label: 'Voltage Imbalance', value: `${randomBetween(1, 5)}%`, percentage: randomBetween(20, 40), color: '#ffce56' },
        { label: 'V AVG', value: `${randomBetween(435, 440)}V`, percentage: randomBetween(90, 98), color: '#169c33' }
      ]
    },

    // Add mock data structures for all other components
    threePhaseVoltageLN: {
      title: '3 PHASE VOLTAGE L-N',
      ref: 11,

      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      phasorVolts: voltageValuesLN,
      timestamp: new Date().toLocaleString(),
      phasorTable: [
        { label: 'VRN', value: `${voltageValuesLN[0]}V` },
        { label: 'VYN', value: `${voltageValuesLN[1]}V` },
        { label: 'VBN', value: `${voltageValuesLN[2]}V` }
      ],
      imbalanceMetrics: [
        { label: 'Max Dev', value: `${randomBetween(2, 5)}V`, percentage: randomBetween(60, 80) },
        { label: 'Voltage Imbalance', value: `${randomBetween(1, 5)}%`, percentage: randomBetween(60, 80), color: '#ffce56' },
        { label: 'V AVG', value: `${randomBetween(225, 235)}V`, percentage: randomBetween(90, 98) }
      ]
    },
    // systemFrequency: {
    //   /* ...mock data... */
    // },
    systemFrequency: {
      title: 'SYSTEM FREQUENCY',
      ref: 13,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      ...freqData
    },
    threeCurrentComposition: {
      title: '3PH LINE CURRENT CONSUMPTION',
      ref: 12,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      currents: {
        ir: randomBetween(180, 250),
        iy: randomBetween(150, 210),
        ib: randomBetween(120, 170)
      }
    },
    energyConsumption: {
      title: 'ENERGY CONSUMPTION',
      ref: 15,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      totalKWH: randomBetween(2000, 2500),
      totalKVARh: randomBetween(200, 500),
      totalKVAh: randomBetween(2000, 3000),
      breakdown: [
        { name: 'Air Comp 1', value: 15.2 },
        { name: 'Feeder 1 (F1)', value: 33.5 },
        { name: 'Blower 2', value: 18.1 },
        { name: 'Feeder 2 (F2)', value: 27.8 },
        { name: 'Feeder 3 (F3)', value: 25.31 },
        { name: 'Feeder 4 (F4)', value: 29.4 }
      ]
    },
    powerConsumption: {
      title: 'POWER CONSUMPTION',
      ref: 15,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      phases: powerConsumptionPhases,
      kw_avg: powerConsumptionPhases.kw.reduce((a, b) => a + b, 0) / 3,
      kva_avg: powerConsumptionPhases.kva.reduce((a, b) => a + b, 0) / 3,
      kvar_avg: powerConsumptionPhases.kvar.reduce((a, b) => a + b, 0) / 3
    },
    totalPowerConsumption: {
      title: 'TOTAL POWER CONSUMPTION',
      ref: 16,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      totalPower: totalPowerData,
      maxDemand: maxDemandData
    },
    harmonics: {
      title: 'HARMONICS (THD)',
      ref: 17,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      thdV: { percentage: thdVPercentage },
      thdI: { percentage: thdIPercentage }
    },
    thdV: { percentage: thdVPercentage },
    rtLoadModalData: {
      title: 'REAL-TIME LOAD & LOAD FACTOR',

      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      ratedLoad: ratedLoad,
      realtimeLoad: realtimeLoad,
      rtLoad: {
        percentage: rtLoadPercentage
      },

      peakDemand: peakDemand,
      avgPower: avgPower,
      performance: {
        score: performanceScoreValue
      }
    },
    powerFactor: {
      title: 'AVERAGE PF FACTOR',
      ref: 14,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toLocaleString(),
      phases: pfValues,
      avg: avgPF
    },
    rtLoad: {
      percentage: rtLoadPercentage
    }
  };
};

const RealtimeLayoutPage2 = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pageRef = React.useRef(null);

  // State and handlers for modals
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const handleOpenPanelModal = () => setIsPanelModalOpen(true);
  const handleClosePanelModal = () => setIsPanelModalOpen(false);

  const [isVoltageModalOpen, setIsVoltageModalOpen] = useState(false);
  const handleOpenVoltageModal = () => setIsVoltageModalOpen(true);
  const handleCloseVoltageModal = () => setIsVoltageModalOpen(false);

  //ThreePhaseVoltageLN

  const [isVoltageLNModalOpen, setIsVoltageLNModalOpen] = useState(false);
  const handleOpenVoltageLNModal = () => setIsVoltageLNModalOpen(true);
  const handleCloseVoltageLNModal = () => setIsVoltageLNModalOpen(false);

  //Current Composition
  const [isCurrentCompModalOpen, setIsCurrentCompModalOpen] = useState(false);
  const handleOpenCurrentCompModal = () => setIsCurrentCompModalOpen(true);
  const handleCloseCurrentCompModal = () => setIsCurrentCompModalOpen(false);
  const [activeThd, setActiveThd] = useState('voltage');
  const [activeEnergy, setActiveEnergy] = useState('kwh');
  const [costData, setCostData] = useState(null);
  const [isCostLoading, setIsCostLoading] = useState(true);
  // const handleThdToggle = () => {
  //   setShowThdVoltage((prevState) => !prevState);
  // };

  //System Frequency
  const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);
  const handleOpenFrequencyModal = () => {
    console.log('Attempting to open Frequency Modal...');
    setIsFrequencyModalOpen(true);
  };
  const handleCloseFrequencyModal = () => setIsFrequencyModalOpen(false);
  //Avg PF Modal
  const [isAvgPFModalOpen, setIsAvgPFModalOpen] = useState(false);
  const handleOpenAvgPFModal = () => setIsAvgPFModalOpen(true);
  const handleCloseAvgPFModal = () => setIsAvgPFModalOpen(false);
  //Energy Consumption
  const [isEconsumptionModalOpen, setIsEConsumptionModalOpen] = useState(false);
  const handleOpenEConsumptionModal = () => setIsEConsumptionModalOpen(true);
  const handleCloseEConsumptionModal = () => setIsEConsumptionModalOpen(false);
  //Power Consumption
  const [isPowerConsumptionModalOpen, setIsPowerConsumptionModalOpen] = useState(false);
  const handleOpenPowerConsumptionModal = () => setIsPowerConsumptionModalOpen(true);
  const handleClosePowerConsumptionModal = () => setIsPowerConsumptionModalOpen(false);
  //total power consumption
  const [isTotalPowerModalOpen, setIsTotalPowerModalOpen] = useState(false);
  const handleOpenTotalPowerModal = () => setIsTotalPowerModalOpen(true);
  const handleCloseTotalPowerModal = () => setIsTotalPowerModalOpen(false);
  //harmonics
  const [isHarmonicsModalOpen, setIsHarmonicsModalOpen] = useState(false);
  const handleOpenHarmonicsModal = () => setIsHarmonicsModalOpen(true);
  const handleCloseHarmonicsModal = () => setIsHarmonicsModalOpen(false);
  //rtload
  const [isRTLoadModalOpen, setIsRTLoadModalOpen] = useState(false);
  const handleOpenRTLoadModal = () => setIsRTLoadModalOpen(true);
  const handleCloseRTLoadModal = () => setIsRTLoadModalOpen(false);
  //time window
  const [isTimeWindowOpen, setIsTimeWindowOpen] = useState(false);
  const [timeWindow, setTimeWindow] = useState({
    type: 'last',
    value: '5 minutes',
    aggregation: 'Average',
    groupingInterval: '5 seconds'
  });
  const handleOpenTimeWindow = () => setIsTimeWindowOpen(true);
  const handleCloseTimeWindow = () => setIsTimeWindowOpen(false);
  const handleUpdateTimeWindow = (newSettings) => {
    console.log('Time window updated (display only):', newSettings);
    setTimeWindow(newSettings);
    setIsTimeWindowOpen(false);
    // NOTE: Backend fetch is not called here.
  };

  // --- CHANGE: Use setInterval to simulate real-time data ---
  const handleRefreshData = () => {
    console.log('Refreshing data...');
    setTelemetryData(generateRandomData());
  };

  const [telemetryData, setTelemetryData] = useState(null);
  const [error, setError] = useState(null);
  // We get udid and did from the URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const udid = queryParams.get('udid');
  const did = queryParams.get('did');
  //telemetry data
  // In RealtimeLayoutPage2.js

  useEffect(() => {
    const fetchTelemetryData = async () => {
      if (!did) {
        console.warn('Device ID (did) is missing, skipping telemetry fetch.');
        setError('Device ID is missing from the URL.');
        setTelemetryData(null);
        return;
      }
      try {
        setError(null);

        const apiUrl = `${import.meta.env.VITE_APP_API_REALTIME}/api/v1/telemetry/rtl2?did=${did}`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data.data && response.data.data.length > 0) {
          setTelemetryData(response.data.data);
        } else {
          throw new Error('API response did not contain the expected data.');
        }
      } catch (error) {
        console.error('Error fetching telemetry data:', error);
        setError(error);
      }
    };

    fetchTelemetryData();
    const intervalId = setInterval(fetchTelemetryData, 5000);
    return () => clearInterval(intervalId);
  }, [udid, did]);
  useEffect(() => {
    const fetchCostData = () => {
      console.log('Fetching cost data...');
      setTimeout(() => {
        const mockData = {
          current: 28180.55,
          previous: 26540.12
        };
        setCostData(mockData);
        setIsCostLoading(false);
        console.log('Cost data loaded.');
      }, 2000); // Simulate a 2-second network delay
    };

    fetchCostData();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (pageRef.current) {
        pageRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  if (!telemetryData) {
    return <div>Loading...</div>;
  }
  const currentRecord = telemetryData[0];
  const previousRecord = telemetryData.length > 1 ? telemetryData[1] : null;

  const totalPowerDataForWidget = {
    kw: currentRecord.TOTAL_KW,
    kva: currentRecord.TOTAL_KVA.toFixed(2),
    kvar: currentRecord.TOTAL_KVAR
  };
  const panelInfoData = {
    name: 'Main LT Panel', // Default value
    location: 'Shop Floor, Assembly', // Default value
    criticalAlarms: 7, // Default value
    warningAlarms: 10, // Default value
    panelStatus: 'ON' // This can be tied to live API data later
  };

  const voltageData = {
    // Raw values for tooltip and modal view
    vry: currentRecord.VRY || 0,
    vyb: currentRecord.VYB || 0,
    vbr: currentRecord.VBR || 0,

    // Pre-calculated values from the API for the segment display
    v_avg: currentRecord.AVG_VLL || 0,
    imbalance: currentRecord.LL_VOL_IMB || 0,
    v_avg_previous: previousRecord ? previousRecord.AVG_VLL : null,
    imbalance_previous: previousRecord ? previousRecord.LL_VOL_IMB : null,

    // Data for the modal's phasor chart
    phasorVolts: [currentRecord.VRY, currentRecord.VYB, currentRecord.VBR]
  };
  console.log('Data being sent to VoltageSegment:', voltageData);

  const voltageLNData = {
    // Raw values for tooltip
    vrn: currentRecord.VR || 0,
    vyn: currentRecord.VY || 0,
    vbn: currentRecord.VB || 0,

    // Pre-calculated values from the API for the segment display
    v_avg: currentRecord.AVG_VLN || 0,
    imbalance: currentRecord.LN_VOL_IMB || 0,
    v_avg_previous: previousRecord ? previousRecord.AVG_VLN : null,
    imbalance_previous: previousRecord ? previousRecord.LN_VOL_IMB : null,
    // Placeholder for 24h average data (can be added later)
    v_avg_24h: null,
    imbalance_24h: null
  };

  const currentData = {
    // Raw values for tooltip
    ir: currentRecord.IR || 0,
    iy: currentRecord.IY || 0,
    ib: currentRecord.IB || 0,

    // Values for the segment display
    avg_i: currentRecord.AVG_I || 0,
    avg_i_previous: previousRecord ? previousRecord.AVG_I : null,

    I_CURR_IMB: currentRecord.I_CURR_IMB || 0,
    I_CURR_IMB_previous: previousRecord ? previousRecord.I_CURR_IMB : null
  };

  const powerConsumptionData = {
    phases: {
      kw: [currentRecord.R_KW, currentRecord.Y_KW, currentRecord.B_KW],
      kva: [currentRecord.R_KVA, currentRecord.Y_KVA, currentRecord.B_KVA],
      kvar: [currentRecord.R_KVAR, currentRecord.Y_KVAR, currentRecord.B_KVAR]
    }
  };

  const energyConsumptionData = {
    totalKWH: currentRecord.KWH,
    totalKVAh: currentRecord.KVAH,
    totalKVARh: currentRecord.KVARH,
    totalKWH_previous: previousRecord ? previousRecord.KWH : null,
    totalKVAh_previous: previousRecord ? previousRecord.KVAH : null
  };

  const totalPowerData = {
    totalKva: currentRecord.TOTAL_KVA,
    kvaImbalance: currentRecord.KVA_IMB_PCT,
    totalKw: currentRecord.TOTAL_KW,
    kwImbalance: currentRecord.KW_IMB_PCT
  };

  const avgPFData = {
    avg: currentRecord.AVG_PF,
    phases: {
      r: currentRecord.R_PF,
      y: currentRecord.Y_PF,
      b: currentRecord.B_PF
    }
  };

  const frequencyData = {
    avg: currentRecord.FREQUENCY,

    min: currentRecord.FREQUENCY - 0.5,
    max: currentRecord.FREQUENCY + 0.5
  };

  const loadData = {
    percentage: 0
  };

  const avgThdV = (currentRecord.R_THD_V + currentRecord.Y_THD_V + currentRecord.B_THD_V) / 3;
  const thdvData = {
    percentage: avgThdV //to review
  };
  const avgThdI = (currentRecord.R_THD_I + currentRecord.Y_THD_I + currentRecord.B_THD_I) / 3;
  const thdiData = {
    percentage: avgThdI
  };

  // For PerformanceSegment - NOTE: API data is missing for this
  const performanceScore = currentRecord.PERFORMANCE_SCORE || 84;

  const performanceData = {
    score: performanceScore
  };
  //modal data
  const currentCompModalData = {
    title: '3PH LINE CURRENT CONSUMPTION',
    timestamp: new Date(currentRecord.TS).toLocaleString(),
    currents: {
      ir: currentRecord.IR.toFixed(1),
      iy: currentRecord.IY.toFixed(1),
      ib: currentRecord.IB.toFixed(1)
    },
    avg_i: currentRecord.AVG_I.toFixed(1),
    max_dev: currentRecord.I_MAX_DEV.toFixed(1)
  };
  const timestamp = new Date(currentRecord.TS).toLocaleString();
  const date = new Date(currentRecord.TS).toLocaleDateString();
  const time = new Date(currentRecord.TS).toLocaleTimeString();

  const panelInfoModalData = {
    name: 'HT Panel',
    panelId: currentRecord.DID,
    installDate: '25-07-2025', // Default value
    owner: 'Ravishankar', // Default value
    ratedCapacity: '4200 kVA', // Default value
    cloudStatus: 'Connected',
    panelStatus: 'ON'
  };

  const voltageLLModalData = {
    title: '3 PHASE VOLTAGE L-L',
    timestamp,
    date,
    time,
    phasorVolts: [currentRecord.VRY, currentRecord.VYB, currentRecord.VBR],
    phasorTable: [
      { label: 'VRY', value: `${currentRecord.VRY.toFixed(1)}V` },
      { label: 'VYB', value: `${currentRecord.VYB.toFixed(1)}V` },
      { label: 'VBR', value: `${currentRecord.VBR.toFixed(1)}V` }
    ],
    imbalanceMetrics: [
      { label: 'Max Dev', value: `${currentRecord.LL_MAX_DEV.toFixed(1)}V` },
      { label: 'Voltage Imbalance', value: `${currentRecord.LL_VOL_IMB.toFixed(1)}%` },
      { label: 'V AVG', value: `${currentRecord.AVG_VLL.toFixed(1)}V` }
    ]
  };

  const voltageLNModalData = {
    title: '3 PHASE VOLTAGE L-N',
    timestamp,
    date,
    time,
    phasorVolts: [currentRecord.VR, currentRecord.VY, currentRecord.VB],
    phasorTable: [
      { label: 'VRN', value: `${currentRecord.VR.toFixed(1)}V` },
      { label: 'VYN', value: `${currentRecord.VY.toFixed(1)}V` },
      { label: 'VBN', value: `${currentRecord.VB.toFixed(1)}V` }
    ],
    imbalanceMetrics: [
      { label: 'Max Dev', value: `${currentRecord.LN_MAX_DEV.toFixed(1)}V` },
      { label: 'Voltage Imbalance', value: `${currentRecord.LN_VOL_IMB.toFixed(1)}%` },
      { label: 'V AVG', value: `${currentRecord.AVG_VLN.toFixed(1)}V` }
    ]
  };

  const frequencyModalData = {
    title: 'SYSTEM FREQUENCY',
    timestamp,
    date,
    time,
    avg: currentRecord.FREQUENCY,
    min: currentRecord.FREQUENCY - 0.5, // Example value
    max: currentRecord.FREQUENCY + 0.5 // Example value
  };

  const powerFactorModalData = {
    title: 'AVERAGE PF FACTOR',
    timestamp,
    date,
    time,
    avg: currentRecord.AVG_PF,
    phases: {
      r: currentRecord.R_PF,
      y: currentRecord.Y_PF,
      b: currentRecord.B_PF
    }
  };

  const energyConsumptionModalData = {
    title: 'ENERGY CONSUMPTION',
    date: new Date(currentRecord.TS).toLocaleDateString(),
    time: new Date(currentRecord.TS).toLocaleTimeString(),

    kwhData: {
      current: currentRecord.KWH,
      previous: previousRecord ? previousRecord.KWH : null,
      delta: currentRecord.DELTA_KWH
    },
    kvahData: {
      current: currentRecord.KVAH,
      previous: previousRecord ? previousRecord.KVAH : null,
      delta: currentRecord.DELTA_KVAH
    },
    kvarhData: {
      current: currentRecord.KVARH,
      previous: previousRecord ? previousRecord.KVARH : null,
      delta: currentRecord.DELTA_KVARH
    }
  };

  const totalPowerConsumptionModalData = {
    title: 'TOTAL POWER CONSUMPTION',
    date: new Date(currentRecord.TS).toLocaleDateString(),
    time: new Date(currentRecord.TS).toLocaleTimeString(),
    // Nested object for the 3-phase distribution chart
    phases: {
      kw: [currentRecord.R_KW, currentRecord.Y_KW, currentRecord.B_KW],
      kva: [currentRecord.R_KVA, currentRecord.Y_KVA, currentRecord.B_KVA],
      kvar: [currentRecord.R_KVAR, currentRecord.Y_KVAR, currentRecord.B_KVAR]
    },
    // Nested object for the donut chart
    totalPower: {
      kw: currentRecord.TOTAL_KW.toFixed(2),
      kva: currentRecord.TOTAL_KVA.toFixed(2),
      kvar: currentRecord.TOTAL_KVAR.toFixed(2)
    },
    // Imbalance data for the imbalance chart
    kwImbalance: currentRecord.KW_IMB_PCT,
    kvaImbalance: currentRecord.KVA_IMB_PCT,
    kvarImbalance: currentRecord.KVAR_IMB_PCT
  };

  const harmonicsModalData = {
    title: 'HARMONICS (THD)',
    timestamp,
    date,
    time,
    thdV: { percentage: (currentRecord.R_THD_V + currentRecord.Y_THD_V + currentRecord.B_THD_V) / 3 },
    thdI: { percentage: (currentRecord.R_THD_I + currentRecord.Y_THD_I + currentRecord.B_THD_I) / 3 }
  };

  const rtLoadModalData = {
    title: 'REAL-TIME LOAD & LOAD FACTOR',
    timestamp,
    date,
    time,
    ratedLoad: 4200, // Default value
    realtimeLoad: currentRecord.TOTAL_KVA.toFixed(2), // Use Total kVA as real-time load
    rtLoad: {
      percentage: (currentRecord.TOTAL_KVA / 4200) * 100
    },
    peakDemand: currentRecord.TOTAL_KVA.toFixed(2), // Use current Total kVA as peak
    avgPower: currentRecord.TOTAL_KW.toFixed(2), // Use current Total kW as avg
    performance: {
      score: 85 // Default value
    }
  };
  return (
    <div style={styles.pageWrapper} ref={pageRef}>
      <div style={styles.pageWrapper} ref={pageRef}>
        <button style={styles.fullscreenButton} onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        <div className="dashboard-layout">
          {/* --- Column 1 --- */}
          <div className="dashboard-column">
            <PanelInfoSegment className="c1-item1" data={panelInfoData} onExpandClick={handleOpenPanelModal} />

            <VoltageSegment className="c1-item2" data={voltageData} onExpandClick={handleOpenVoltageModal} />

            <VoltageLNSegment data={voltageLNData} onExpandClick={handleOpenVoltageLNModal} />
            {/* <div className="card">
              <FrequencySegment data={telemetryData.systemFrequency} onExpandClick={handleOpenFrequencyModal} />
            </div> */}
          </div>

          {/* --- Column 2 (Wider) --- */}
          <div className="dashboard-column col-wide">
            <div className="card c2-item1">
              <CurrentCompSegment data={currentData} onExpandClick={handleOpenCurrentCompModal} />
            </div>

            <div style={segmentCardStyle} className="card c2-item3">
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Energy Consumption</div>
                <div style={styles.cardControls}>
                  <SegmentedControl
                    options={[
                      { id: 'kwh', label: 'kWh' },
                      { id: 'kvah', label: 'kVAh' }
                    ]}
                    activeOptionId={activeEnergy}
                    onSelect={setActiveEnergy}
                  />
                  <Maximize size={16} style={styles.expandIcon} onClick={handleOpenEConsumptionModal} />
                </div>
              </div>
              {/* The component now receives the previous values via the data prop */}
              <EnergyConsumptionSegment data={energyConsumptionData} activeMetric={activeEnergy} />
            </div>

            <div className="card c2-item2">
              <TotalPowerSegment data={totalPowerData} onExpandClick={handleOpenTotalPowerModal} />
            </div>
          </div>

          {/* --- Column 3 --- */}
          <div className="dashboard-column">
            <div className="card">
              <AvgPFSegment data={avgPFData} onExpandClick={handleOpenAvgPFModal} />
            </div>
            <div style={styles.cardStyle}>
              <RealtimeCost data={costData} isLoading={isCostLoading} onExpandClick={() => {}} />
            </div>
            <div className="card">
              <FrequencySegment data={frequencyData} onExpandClick={handleOpenFrequencyModal} />
            </div>

            {/* <div className="card">
              <MaxDemandSegment data={telemetryData.maxDemand} />
            </div> */}
          </div>

          {/* --- Column 4 --- */}
          <div className="dashboard-column">
            <div className="card">
              <LoadSegment data={loadData} onExpandClick={handleOpenRTLoadModal} />
            </div>
            <div className="card">
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>THD</div>
                <div style={styles.cardControls}>
                  <SegmentedControl
                    options={[
                      { id: 'voltage', label: 'V' },
                      { id: 'current', label: 'I' }
                    ]}
                    activeOptionId={activeThd}
                    onSelect={setActiveThd}
                  />
                  <Maximize size={16} style={styles.expandIcon} onClick={handleOpenHarmonicsModal} />
                </div>
              </div>
              {activeThd === 'voltage' ? <THDVSegment data={thdvData} /> : <THDISegment data={thdiData} />}
            </div>

            <div className="card">
              <PerformanceSegment score={performanceData.score} machineId={did} />
            </div>
          </div>
        </div>

        {isPanelModalOpen &&
          createPortal(
            <div style={styles.modalOverlay} onClick={handleClosePanelModal}>
              <PanelInfoModal data={panelInfoModalData} onClose={handleClosePanelModal} />
            </div>,
            document.body
          )}
        {isVoltageModalOpen &&
          createPortal(
            <div style={styles.modalOverlay} onClick={handleCloseVoltageModal}>
              <VoltageModal
                data={voltageLLModalData}
                onClose={handleCloseVoltageModal}
                onOpenTimeWindow={handleOpenTimeWindow}
                isTimeWindowOpen={isTimeWindowOpen}
                timeWindowSettings={timeWindow}
                onCloseTimeWindow={handleCloseTimeWindow}
                onUpdateTimeWindow={handleUpdateTimeWindow}
              />
            </div>,
            document.body
          )}

        {isVoltageLNModalOpen &&
          createPortal(
            <div style={styles.modalOverlay} onClick={handleCloseVoltageLNModal}>
              <VoltageLNModal data={voltageLNModalData} onClose={handleCloseVoltageLNModal} />
            </div>,
            document.body
          )}

        {isCurrentCompModalOpen &&
          createPortal(
            <div style={styles.modalOverlay} onClick={handleCloseCurrentCompModal}>
              <CurrentBarChartModal data={currentCompModalData} onClose={handleCloseCurrentCompModal} />
            </div>,
            document.body
          )}
      </div>
      {isFrequencyModalOpen &&
        createPortal(
          <div style={styles.modalOverlay} onClick={handleCloseFrequencyModal}>
            <FrequencyModal data={frequencyModalData} onClose={handleCloseFrequencyModal} />
          </div>,
          document.body
        )}
      {isAvgPFModalOpen &&
        createPortal(
          <div style={styles.modalOverlay} onClick={handleCloseAvgPFModal}>
            <AvgPFModal data={powerFactorModalData} onClose={handleCloseAvgPFModal} />
          </div>,
          document.body
        )}
      {isEconsumptionModalOpen &&
        createPortal(
          <div style={styles.modalOverlay} onClick={handleCloseEConsumptionModal}>
            <EnergyConsumptionModal data={energyConsumptionModalData} onClose={handleCloseEConsumptionModal} />
          </div>,
          document.body
        )}
      {isPowerConsumptionModalOpen &&
        createPortal(
          <div style={styles.modalOverlay} onClick={handleClosePowerConsumptionModal}>
            <PowerConsumptionModal
              data={telemetryData.powerConsumption}
              onClose={handleClosePowerConsumptionModal}
              onRefresh={handleRefreshData}
            />
          </div>,
          document.body
        )}
      {isTotalPowerModalOpen &&
        createPortal(
          <div style={styles.modalOverlay} onClick={handleCloseTotalPowerModal}>
            <TotalPowerConsumptionModal data={totalPowerConsumptionModalData} onClose={handleCloseTotalPowerModal} />
          </div>,
          document.body
        )}
      {isHarmonicsModalOpen &&
        createPortal(
          <div style={styles.modalOverlay} onClick={handleCloseHarmonicsModal}>
            <HarmonicsModal data={harmonicsModalData} onClose={handleCloseHarmonicsModal} />
          </div>,
          document.body
        )}
      {isRTLoadModalOpen &&
        createPortal(
          <div style={styles.modalOverlay} onClick={handleCloseRTLoadModal}>
            <RTLoadModal data={rtLoadModalData} onClose={handleCloseRTLoadModal} />
          </div>,
          document.body
        )}
    </div>
  );
};

export default RealtimeLayoutPage2;
