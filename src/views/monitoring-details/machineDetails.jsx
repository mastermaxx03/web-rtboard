import React, { useEffect, useState } from 'react';

const MachineDetails = ({ machineId }) => {
  const [machineData, setMachineData] = useState(null);

  useEffect(() => {
    // Simulate fetching machine data based on machineId
    const fetchMachineData = async () => {
      // Replace this with an actual API call
      const response = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              id: machineId,
              name: `Machine ${machineId}`,
              status: 'Active'
            }),
          1000
        )
      );
      setMachineData(response);
    };

    fetchMachineData();
  }, [machineId]);

  if (!machineData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Machine Details</h1>
      <p>
        <strong>ID:</strong> {machineData.id}
      </p>
      <p>
        <strong>Name:</strong> {machineData.name}
      </p>
      <p>
        <strong>Status:</strong> {machineData.status}
      </p>
    </div>
  );
};

export default MachineDetails;
