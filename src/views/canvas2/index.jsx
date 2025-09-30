import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Controls } from 'reactflow';
import CustomNode from './CustomNode';
import InspectorPanel from './InspectorPanel';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slide,
  TextField,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import dagre from 'dagre';
import { useMachineStatus } from '../../contexts/MachineStatusContext';
import { getPerformanceStatus } from '../../utils/statusUtils';
import 'reactflow/dist/style.css';
import { fetchAllMachineStatuses } from '../../api/machineService';
const EDIT_MODE_PASSWORD = import.meta.env.VITE_EDIT_MODE_PASSWORD;
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 120;
const nodeHeight = 150;
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'top';
    node.sourcePosition = 'bottom';
    node.position = { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 };
    return node;
  });
  return { nodes, edges };
};
// ---------------------------------

let nodeIdCounter = 0;
const getNodeId = () => `${nodeIdCounter++}`;
let edgeIdCounter = 0;
const getEdgeId = () => `e_${edgeIdCounter++}`;
const nodeTypes = { custom: CustomNode };

const initialPanelItems = [
  { name: 'HT Incomer', color: '#C8E6C9' }, // Light Green
  { name: 'HT Outgoing', color: '#BBDEFB' }, // Light Blue
  { name: 'Transformer', color: '#FFE0B2' }, // Light Orange
  { name: 'LT Incomer', color: '#C8E6C9' }, // Light Green
  { name: 'LT Outgoing', color: '#BBDEFB' }, // Light Blue
  { name: 'PCC Incomer', color: '#FFF9C4' }, // Light Yellow
  { name: 'PCC Outgoing', color: '#B2EBF2' }, // Light Cyan
  { name: 'APFC', color: '#E1BEE7' }, // Light Purple
  { name: 'DG Panel', color: '#D7CCC8' }, // Light Brown
  { name: 'MCC Panel', color: '#FFCDD2' } // Light Red
];

const panelColors = [
  '#FFCDD2', // Light Red
  '#E1BEE7', // Light Purple
  '#C5CAE9', // Light Indigo
  '#BBDEFB', // Light Blue
  '#B2EBF2', // Light Cyan
  '#C8E6C9', // Light Green
  '#FFF9C4', // Light Yellow
  '#FFE0B2', // Light Orange
  '#D7CCC8', // Light Brown
  '#F5F5F5', // Light Grey
  '#CFD8DC', // Light Blue Grey
  '#F8BBD0', // Pink
  '#D1C4E9' // Deep Purple A100
];

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * panelColors.length);
  return panelColors[randomIndex];
};

export default function CanvasPage() {
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState('loading');
  const [isEditMode, setIsEditMode] = useState(false);
  const reactFlowWrapper = useRef(null);
  const isDraggingFromSidebar = useRef(false);
  const [initialNodes, setInitialNodes] = useState([]);
  const [initialEdges, setInitialEdges] = useState([]);

  //deletion check
  const protectedParentIds = useRef(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isFocusMode, setFocusMode] = useState(false);

  const [panelItems, setPanelItems] = useState(initialPanelItems);
  const [newItemName, setNewItemName] = useState('');

  const [transformerCount, setTransformerCount] = useState(0);
  const [feederCount, setFeederCount] = useState(0);
  const [rmuCount, setRmuCount] = useState(0);
  const [customItemCounts, setCustomItemCounts] = useState({});

  const [connectionMenu, setConnectionMenu] = useState(null);
  const currentConnection = useRef(null);
  const connectionCounts = useRef({});
  const [selectedNode, setSelectedNode] = useState(null);

  //changes const [contextMenu, setContextMenu] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [hasFittedOnLoad, setHasFittedOnLoad] = useState(false);

  const { updateMachineStatus } = useMachineStatus();
  useEffect(() => {
    const loadInitialStatuses = async () => {
      try {
        const machineSummaries = await fetchAllMachineStatuses();
        machineSummaries.forEach((machine) => {
          const status = getPerformanceStatus(machine.performanceScore);
          updateMachineStatus(machine.deviceId, { status: status, score: machine.performanceScore });
        });
      } catch (error) {
        console.error('Failed to fetch machine statuses:', error);
      }
    };
    loadInitialStatuses();
  }, [updateMachineStatus]);

  const handlePanelClose = () => {
    setSelectedNode(null);
  };
  const handleNodeClick = (event, clickedNode) => {
    if (selectedNode) {
      if (selectedNode.id !== clickedNode.id) {
        setSelectedNode(null);
      }
    }
  };
  const handleStyleChange = (nodeId, style) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...style } };
        }
        return node;
      })
    );
  };
  useEffect(() => {
    if (selectedNode) {
      const latestNodeData = nodes.find((n) => n.id === selectedNode.id);

      if (latestNodeData && latestNodeData.data !== selectedNode.data) {
        setSelectedNode(latestNodeData);
      }
    }
  }, [nodes, selectedNode]);
  useEffect(() => {
    // We check for the instance, the nodes, and our flag
    if (reactFlowInstance && nodes.length > 0 && !hasFittedOnLoad) {
      // Call the fitView method from the instance
      reactFlowInstance.fitView();
      setHasFittedOnLoad(true);
    }
  }, [reactFlowInstance, nodes, hasFittedOnLoad]);
  //context menu
  const handleNodeContextMenu = (event, node) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      node: node
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleMenuChoice = (choice) => {
    const clickedNode = contextMenu.node;
    handleContextMenuClose(); // Close the small menu

    if (choice === 'INFO') {
      setSelectedNode(clickedNode);
    } else if (choice === 'DASHBOARD') {
      const deviceId = clickedNode.data.deviceId;

      if (deviceId) {
        navigate(`/realtime-dashboard2?did=${deviceId}`);
      } else {
        setNotification({
          open: true,
          message: 'Error: This node does not have a device ID.',
          severity: 'error'
        });
      }
    } else if (choice === 'KPI') {
      // Show a notification for the placeholder
      setNotification({
        open: true,
        message: 'KPI View will be available in a future update.',
        severity: 'info'
      });
    }
  };
  const handleToggleFocusMode = () => setFocusMode((prev) => !prev);
  //there is mismatch in json file which has been corrected in the code
  const loadInitialDiagram = useCallback(async () => {
    setLoadingState('loading');
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_POLICY}/api/v1/policy/espai_company1`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const dat = await response.json();
      const data = dat.policy.jsonObj;
      console.log('Fetch response:', data);
      if (data && data.nodes && data.edges) {
        let maxNodeId = -1;
        let maxEdgeId = -1;
        let tCount = 0,
          fCount = 0,
          rCount = 0;
        const cCounts = {};
        data.nodes.forEach((node) => {
          if (node.data && node.id) {
            const numericId = parseInt(node.id, 10);
            if (!isNaN(numericId) && numericId > maxNodeId) {
              maxNodeId = numericId;
            }
            const nodeName = node.data.label || '';
            if (nodeName.includes('Transformer')) tCount++;
            else if (nodeName.includes('Feeder')) fCount++;
            else if (nodeName.includes('RMU')) rCount++;
            else {
              const baseName = nodeName.replace(/\s\d+$/, '');
              if (baseName) cCounts[baseName] = (cCounts[baseName] || 0) + 1;
            }
          }
        });
        //for edge numbering
        data.edges.forEach((edge) => {
          // Extracts the number from an ID like 'e_19'
          const parts = String(edge?.id || '').split('_');
          const numericId = parts[1] ? parseInt(parts[1], 10) : NaN;
          if (!isNaN(numericId) && numericId > maxEdgeId) {
            maxEdgeId = numericId;
          }
        });

        nodeIdCounter = maxNodeId + 1;
        edgeIdCounter = maxEdgeId + 1;
        setTransformerCount(tCount);
        setFeederCount(fCount);
        setRmuCount(rCount);
        setCustomItemCounts(cCounts);
        const nodesWithDefaults = data.nodes.map((node) => {
          // If the node from the JSON already has an icon, don't overwrite it.
          if (node?.data?.icon) {
            return node;
          }
          let defaultIcon = null; // Default for any node that doesn't match a rule

          // Assign specific icons based on the device name
          const name = node?.data?.deviceName ?? '';

          if (name.includes('Transformer')) {
            defaultIcon = 'Transformer';
          } else if (name.includes('RMU')) {
            defaultIcon = 'RMU';
          } else if (name.includes('Feeder')) {
            defaultIcon = 'Feeder';
          } else if (name.includes('Compressor')) {
            defaultIcon = 'Compressor';
          }

          return {
            ...node,
            data: { ...(node.data || {}), icon: defaultIcon }
          };
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodesWithDefaults, data.edges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setInitialNodes(layoutedNodes);
        setInitialEdges(layoutedEdges);
        setLoadingState('success');
      } else {
        console.error('Fetched data missing nodes/edges:', data);
      }
    } catch (error) {
      console.error('Failed to load diagram:', error);
      setLoadingState('error');
    }
  }, [setNodes, setEdges, setInitialNodes, setInitialEdges]);
  useEffect(() => {
    loadInitialDiagram();
  }, [loadInitialDiagram]);
  const handlePropertyChangeAndSave = useCallback(
    async (nodeId, newStyle) => {
      // Create the new, updated nodes array
      const updatedNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newStyle } };
        }
        return node;
      });

      // Update the local UI state immediately for a responsive feel
      setNodes(updatedNodes);

      // Prepare the payload with the NEW data, not the old state
      const payload = {
        name: 'espai_company1',
        jsonObj: {
          nodes: updatedNodes,
          edges: edges
        }
      };

      try {
        const apiUrl = `${import.meta.env.VITE_APP_API_POLICY}/api/v1/policy`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // On successful save, update the "reset" backup state as well
        setInitialNodes(updatedNodes);
        setNotification({ open: true, message: 'Property change saved!', severity: 'success' });
        return true; // Return true on success
      } catch (error) {
        console.error('Failed to save property change:', error);
        setNotification({ open: true, message: `Failed to save: ${error.message}`, severity: 'error' });

        // IMPORTANT: If save fails, revert the UI change
        setNodes(nodes);

        return false; // Return false on failure
      }
    },
    [nodes, edges, setNodes, setInitialNodes, setNotification]
  );

  //deletion logic
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        handleDeleteSelected(); // Call the new reusable function
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes, edges, setNodes, setEdges, setNotification]);
  //save diagram
  const handleSaveDiagram = async () => {
    const payload = {
      name: 'espai_company1', // The name of the policy to update
      jsonObj: {
        nodes: nodes,
        edges: edges
      }
    };

    try {
      const apiUrl = `${import.meta.env.VITE_APP_API_POLICY}/api/v1/policy`;

      console.log('Attempting to save to URL:', apiUrl);
      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save successful:', result);

      setNotification({
        open: true,
        message: 'Diagram saved successfully!',
        severity: 'success'
      });
      setInitialNodes(nodes);
      setInitialEdges(edges);
    } catch (error) {
      console.error('Failed to save diagram:', error);
      setNotification({
        open: true,
        message: `Failed to save diagram: ${error.message}`,
        severity: 'error'
      });
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFocusMode(false);

        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAddCustomItem = () => {
    if (newItemName.trim() === '' || panelItems.some((item) => item.name.toLowerCase() === newItemName.trim().toLowerCase())) {
      setNewItemName('');
      return;
    }
    const newItem = {
      name: newItemName.trim(),
      color: getRandomColor()
    };
    setPanelItems((prevItems) => [...prevItems, newItem]);
    setCustomItemCounts((prevCounts) => ({
      ...prevCounts,
      [newItem.name]: 0
    }));
    setNewItemName('');
  };

  const onConnectStart = useCallback((event, params) => {
    if (isDraggingFromSidebar.current) {
      return;
    }

    currentConnection.current = params;
  }, []);

  const onConnect = useCallback((params) => {
    currentConnection.current = params;
  }, []);

  const onConnectEnd = useCallback((event) => {
    if (isDraggingFromSidebar.current) {
      return;
    }

    if (currentConnection.current && event.target.classList.contains('react-flow__pane')) {
      setConnectionMenu({
        x: event.clientX,
        y: event.clientY
      });
    } else {
      currentConnection.current = null;
    }
  }, []);
  const handleCableTypeSelection = useCallback(
    (cableType) => {
      if (!currentConnection.current) {
        console.error('Connection parameters missing for edge creation.');
        setConnectionMenu(null);
        return;
      }

      const { source, sourceHandle, target, targetHandle } = currentConnection.current;
      let voltageRating = '';
      let edgeLabel = '';
      let edgeStyle = {};
      const connectionKey = `${source}-${target}`;

      if (cableType === 'HT Cable') {
        edgeLabel = 'HT Cable';
        voltageRating = 'Will be fetched from json file';
        connectionCounts.current[connectionKey] = 0;
        edgeStyle = { strokeWidth: 2 };
      } else if (cableType === 'Normal Cable') {
        edgeLabel = '';

        connectionCounts.current[connectionKey] = (connectionCounts.current[connectionKey] || 0) + 1;
        const count = connectionCounts.current[connectionKey];

        if (count === 1) {
          edgeStyle = { stroke: '#9e9e9e', strokeWidth: 2 };
        } else if (count === 2) {
          edgeStyle = { stroke: '#616161', strokeWidth: 3, strokeDasharray: '5 5' };
        } else if (count === 3) {
          edgeStyle = { stroke: '#424242', strokeWidth: 4, strokeDasharray: '1 4' };
        } else {
          const colors = ['#000000', '#333333', '#666666'];
          const thickness = 2 + (count - 4) * 0.5;
          edgeStyle = {
            stroke: colors[(count - 4) % colors.length],
            strokeWidth: Math.min(thickness, 6),
            strokeDasharray: '2 2'
          };
        }
      }

      const newEdge = {
        id: getEdgeId(),
        source: source,
        sourceHandle: sourceHandle,
        target: target,
        targetHandle: targetHandle,
        type: cableType === 'Normal Cable' ? 'default' : 'smoothstep',
        label: edgeLabel,
        style: edgeStyle
      };

      setEdges((eds) => addEdge(newEdge, eds));

      currentConnection.current = null;
      setConnectionMenu(null);
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      isDraggingFromSidebar.current = false;
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      if (!nodeData) return;

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      let newLabel = '';
      let newId = getNodeId();

      switch (nodeData.name) {
        case 'Transformer':
          newLabel = `Transformer ${transformerCount + 1}`;
          setTransformerCount((c) => c + 1);
          break;
        case 'Feeder':
          newLabel = `Feeder ${feederCount + 1}`;
          setFeederCount((c) => c + 1);
          break;
        case 'RMU':
          newLabel = `RMU ${rmuCount + 1}`;
          setRmuCount((c) => c + 1);
          break;
        default:
          const newCount = (customItemCounts[nodeData.name] || 0) + 1;
          newLabel = `${nodeData.name} ${newCount}`;
          setCustomItemCounts((counts) => ({ ...counts, [nodeData.name]: newCount }));
          break;
      }

      const newNode = {
        id: newId,
        type: 'custom',
        position,
        data: {
          label: newLabel,
          color: nodeData.color,
          deviceId: `DEV-${newId}`,
          deviceName: newLabel
        }
      };
      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
    },
    [reactFlowInstance, setNodes, transformerCount, feederCount, rmuCount, customItemCounts]
  );
  const onDragStart = (event, nodeData) => {
    isDraggingFromSidebar.current = true;
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };
  //reset
  const handleResetLayout = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    // Show a confirmation notification
    setNotification({
      open: true,
      message: 'Layout has been reset to the last saved state.',
      severity: 'info'
    });
  };
  //deletion
  const handleDeleteSelected = () => {
    const nodesToDelete = nodes.filter((node) => node.selected);
    // You only need to check nodes, as edges are deleted automatically when nodes are
    if (nodesToDelete.length === 0) {
      setNotification({
        open: true,
        message: 'No panel selected to delete.',
        severity: 'info'
      });
      return;
    }

    const nodesToDeleteIds = nodesToDelete.map((n) => n.id);
    const parentNodeIdsToProtect = nodesToDeleteIds.filter((nodeId) => edges.some((edge) => edge.source === nodeId));

    if (parentNodeIdsToProtect.length > 0) {
      setNotification({
        open: true,
        message: 'Cannot delete a panel that has outgoing connections. Delete its children first.',
        severity: 'warning'
      });
      return; // Stop the deletion
    }

    // This is a helper from React Flow to remove nodes and their connected edges
    onNodesChange(nodesToDelete.map((n) => ({ id: n.id, type: 'remove' })));
    setSelectedNode(null);
  };
  const handlePasswordSubmit = () => {
    if (passwordInput === EDIT_MODE_PASSWORD) {
      setIsEditMode(true);
      setPasswordDialogOpen(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordInput('');
    setPasswordError('');
  };

  const normalStyle = { display: 'flex', height: 'calc(80vh)', position: 'relative' };
  const focusStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: 'white' };

  return (
    <Box sx={isFocusMode ? focusStyle : normalStyle}>
      {!isFocusMode && (
        <>
          {isEditMode && (
            <>
              <Slide direction="right" in={isSidebarVisible} mountOnEnter unmountOnExit>
                <Paper
                  elevation={3}
                  sx={{ width: '250px', p: 2, zIndex: 10, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Panels
                    </Typography>
                    <IconButton onClick={toggleSidebar}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ flexGrow: 1, px: 1, paddingBottom: 1, overflowY: 'auto' }}>
                    {' '}
                    {panelItems.map((item) => (
                      <Paper
                        key={item.name}
                        onDragStart={(event) => onDragStart(event, item)}
                        draggable
                        elevation={0}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: '6px 12px',
                          m: '6px 0',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          backgroundColor: 'background.default',
                          cursor: 'grab',
                          userSelect: 'none',
                          transition: 'box-shadow 0.2s, border-color 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 1
                          }
                        }}
                      >
                        {/* This is the colored dot */}
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color
                          }}
                        />

                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1, gap: 1 }}>
                    <Button
                      variant="outlined" // Make it the primary action
                      onClick={() => setIsEditMode(false)}
                      fullWidth
                    >
                      Exit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error" // Style it as a secondary/danger action
                      onClick={handleResetLayout}
                      fullWidth
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        handleSaveDiagram();
                        // Create a simplified list of just the info you want to see
                        const simplifiedNodes = nodes.map((node) => ({
                          id: node.id,
                          deviceId: node.data.deviceId,
                          deviceName: node.data.deviceName
                        }));

                        // Log the new, cleaner list to the console
                        console.log('--- Simplified Device List ---');
                        console.table(simplifiedNodes); // .table() provides a nice format

                        console.log('--- Full Node & Edge Data ---');
                        console.log('NODES:', nodes);
                        console.log('EDGES:', edges);
                      }}
                      fullWidth
                    >
                      Save
                    </Button>
                  </Box>
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Add Custom
                    </Typography>
                    <TextField
                      label="Panel Name"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddCustomItem();
                      }}
                      sx={{ mb: 1 }}
                    />
                    <Button variant="contained" fullWidth onClick={handleAddCustomItem}>
                      Add Panel
                    </Button>
                  </Box>
                </Paper>
              </Slide>
              <Slide direction="right" in={!isSidebarVisible} mountOnEnter unmountOnExit>
                <IconButton
                  onClick={toggleSidebar}
                  sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1300, backgroundColor: 'white', boxShadow: 1 }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Slide>
            </>
          )}
        </>
      )}

      <Box sx={{ flexGrow: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
        <Box sx={{ flexGrow: 1, height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loadingState === 'loading' && <CircularProgress />}
          {loadingState === 'error' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography color="error" variant="h6">
                Failed to Load Diagram
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Please check your connection and try again.
              </Typography>
              <Button variant="contained" onClick={loadInitialDiagram}>
                Retry
              </Button>
            </Box>
          )}{' '}
          {loadingState === 'success' && (
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                deleteKeyCode={null}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                onNodeContextMenu={handleNodeContextMenu}
                onNodeClick={handleNodeClick}
                onPaneClick={() => {
                  handleContextMenuClose();

                  setSelectedNode(null);
                }}
              >
                {!isEditMode && (
                  <Tooltip title="Edit Layout" placement="left" arrow>
                    <IconButton
                      onClick={() => setPasswordDialogOpen(true)}
                      sx={{ position: 'absolute', top: 130, right: 10, zIndex: 10, backgroundColor: 'white', boxShadow: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {!selectedNode && (
                  <>
                    <>
                      <Tooltip title="Toggle Fullscreen" placement="left" arrow>
                        <IconButton
                          onClick={handleToggleFocusMode}
                          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10, backgroundColor: 'white', boxShadow: 1 }}
                        >
                          {isFocusMode ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                      </Tooltip>
                    </>
                    <Tooltip title="Auto-Arrange Layout" placement="left" arrow>
                      <IconButton
                        onClick={onLayout}
                        sx={{ position: 'absolute', top: 70, right: 10, zIndex: 10, backgroundColor: 'white', boxShadow: 1 }}
                      >
                        <AccountTreeIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                <Controls showLock={false} position="bottom-right" />

                {connectionMenu && (
                  <Menu
                    open={Boolean(connectionMenu)}
                    onClose={() => {
                      setConnectionMenu(null);
                      currentConnection.current = null;
                    }}
                    anchorReference="anchorPosition"
                    anchorPosition={{ top: connectionMenu.y + 10, left: connectionMenu.x + 10 }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  >
                    <MenuItem onClick={() => handleCableTypeSelection('HT Cable')}>HT Cable</MenuItem>
                    <MenuItem onClick={() => handleCableTypeSelection('Normal Cable')}>Normal Cable</MenuItem>
                  </Menu>
                )}
              </ReactFlow>
            </ReactFlowProvider>
          )}
        </Box>

        <Menu
          open={contextMenu !== null}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
        >
          <MenuItem onClick={() => handleMenuChoice('DASHBOARD')}>Realtime Dashboard</MenuItem>
          <MenuItem onClick={() => handleMenuChoice('KPI')}>KPI View</MenuItem>
          <MenuItem onClick={() => handleMenuChoice('INFO')}>Info Panel</MenuItem>
          <MenuItem
            onClick={() => {
              handleContextMenuClose(); // Close the small menu
              setDeleteDialogOpen(true); // Open the confirmation dialog
            }}
            sx={{ color: 'error.main' }} // Style it in red
          >
            Delete Panel
          </MenuItem>
        </Menu>
      </Box>
      <Dialog open={isPasswordDialogOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>Enter Password</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the password to enable edit mode.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePasswordSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Panel?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the selected panel(s)? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDeleteSelected();
              setDeleteDialogOpen(false);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <InspectorPanel
        node={selectedNode}
        onStyleChange={handleStyleChange}
        onClose={handlePanelClose}
        onPropertyChangeAndSave={handlePropertyChangeAndSave}
      />
      {/*change*/}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
