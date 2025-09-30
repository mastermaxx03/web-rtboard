import React from "react";
import { useParams } from "react-router-dom";
import MachineDetails from "./machineDetails";

const MachinePage = () => {
  // Extract the machine ID from the URL
  const { machineId } = useParams();

  return (
    <div>
      {/* Pass the machine ID to the MachineDetails component */}
      {/* <h1>{machineId}</h1> */}
      <MachineDetails machineId={machineId} />
    </div>
  );
};

export default MachinePage;
