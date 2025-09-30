import React, { createContext, useState, useContext, useCallback } from 'react';

const MachineStatusContext = createContext();

export function MachineStatusProvider({ children }) {
  const [statuses, setStatuses] = useState({});

  const updateMachineStatus = useCallback((machineId, statusUpdate) => {
    setStatuses((prevStatuses) => ({
      ...prevStatuses,
      [machineId]: statusUpdate
    }));
  }, []);

  const value = { statuses, updateMachineStatus };

  return <MachineStatusContext.Provider value={value}>{children}</MachineStatusContext.Provider>;
}

export function useMachineStatus() {
  return useContext(MachineStatusContext);
}
