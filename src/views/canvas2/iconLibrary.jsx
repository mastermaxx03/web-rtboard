import React from 'react';

// --- 1. Import all 15 of your PNG icons ---
// NOTE: You may need to adjust this path based on your folder structure.
import AcVoltageSourceIcon from '../../assets/images/icons/ac-voltage-source.png';
import AirCompressorIcon from '../../assets/images/icons/air-compressor.png';
import ChillerIcon from '../../assets/images/icons/chiller.png';
import ControlPanelIcon from '../../assets/images/icons/control-panel.png';
import ControlSystemIcon from '../../assets/images/icons/control-system.png';
import DistributionBoardIcon from '../../assets/images/icons/distribution-board.png';
import ElectricMotorIcon from '../../assets/images/icons/electric-motor.png';
import ElectricalPanelIcon from '../../assets/images/icons/electrical-panel.png';
import GeneratorIcon from '../../assets/images/icons/generator.png';
import HeaterIcon from '../../assets/images/icons/heater.png';
import IndustryIcon from '../../assets/images/icons/industry.png';
import MotorIcon from '../../assets/images/icons/motor.png';
import PowerTransformerIcon from '../../assets/images/icons/power-transformer.png';
import WeldingMachineIcon from '../../assets/images/icons/welding-machine.png';
import WeldingIcon from '../../assets/images/icons/welding.png';

// --- 2. Map the display names to your imported icons ---
export const iconData = {
  'AC Voltage Source': AcVoltageSourceIcon,
  'Air Compressor': AirCompressorIcon,
  Chiller: ChillerIcon,
  'Control Panel': ControlPanelIcon,
  'Control System': ControlSystemIcon,
  'Distribution Board': DistributionBoardIcon,
  'Electric Motor': ElectricMotorIcon,
  'Electrical Panel': ElectricalPanelIcon,
  Generator: GeneratorIcon,
  Heater: HeaterIcon,
  Industry: IndustryIcon,
  Motor: MotorIcon,
  'Power Transformer': PowerTransformerIcon,
  'Welding Machine': WeldingMachineIcon,
  Welding: WeldingIcon
};

// --- 3. This list is now created automatically from your icons ---
export const iconList = Object.keys(iconData);

// --- 4. The DeviceIcon component now renders an <img> tag ---
export const DeviceIcon = ({ iconName, ...props }) => {
  // Find the image source from our iconData map
  const iconSrc = iconData[iconName];

  // If no icon is found, don't render anything
  if (!iconSrc) {
    return null;
  }

  // Define a default style for the image
  const style = { width: '24px', height: '24px', ...props.style };

  return <img src={iconSrc} alt={iconName} style={style} />;
};
