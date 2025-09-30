import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Controls } from 'reactflow';
import CustomNode from './CustomNode';
import InspectorPanel from './InspectorPanel';
import { Box, Paper, Typography, IconButton, Slide, TextField, Button, Menu, MenuItem } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import dagre from 'dagre';

import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;
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
  { name: 'RMU', color: '#ffeb3b' },
  { name: 'Transformer', color: '#ffcc80' },
  { name: 'Feeder', color: '#ef9a9a' },
  { name: 'Compressor', color: '#90caf9' }
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
  const reactFlowWrapper = useRef(null);
  const isDraggingFromSidebar = useRef(false);
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

  const handleToggleFocusMode = () => setFocusMode((prev) => !prev);
  //there is mismatch in json file which has been corrected in the code
  useEffect(() => {
    const loadInitialDiagram = async () => {
      try {
        const response = await fetch('https://iot-poc-001.s3.ap-south-1.amazonaws.com/hierarchyData3.json');
        const data = await response.json();
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
          data.edges.forEach((edge) => {
            const numericId = parseInt(edge.id.split('_')[1], 10);
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
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(data.nodes, data.edges);
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        } else {
          console.error('Fetched data missing nodes/edges:', data);
        }
      } catch (error) {
        console.error('Failed to load diagram:', error);
      }
    };
    loadInitialDiagram();
  }, [setNodes, setEdges]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // This exits focus mode
        setFocusMode(false);

        // This is the key line that hides the inspector panel
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the listener when the component unmounts
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
    // Prevent starting a connection if dragging a new node from the sidebar
    if (isDraggingFromSidebar.current) {
      return;
    }
    // Save the starting point of the connection
    currentConnection.current = params;
  }, []);

  const onConnect = useCallback((params) => {
    currentConnection.current = params;
  }, []);

  const onConnectEnd = useCallback((event) => {
    // Add this check to prevent the menu from opening after a sidebar drag
    if (isDraggingFromSidebar.current) {
      return;
    }

    if (currentConnection.current && event.target.classList.contains('react-flow__pane')) {
      setConnectionMenu({
        x: event.clientX,
        y: event.clientY
      });
    } else {
      // Clear the connection if it's not finished on the pane
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

      let edgeLabel = '';
      let edgeStyle = {};
      const connectionKey = `${source}-${target}`;

      if (cableType === 'HT Cable') {
        edgeLabel = 'HT Cable';
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
      let newId = getNodeId(); // Get the ID upfront

      // This new logic correctly calculates the label BEFORE creating the node
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

  const normalStyle = { display: 'flex', height: 'calc(100vh - 64px)', position: 'relative' };
  const focusStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: 'white' };

  return (
    <Box sx={isFocusMode ? focusStyle : normalStyle}>
      {!isFocusMode && (
        <>
          <Slide direction="right" in={isSidebarVisible} mountOnEnter unmountOnExit>
            <Paper elevation={3} sx={{ width: '250px', p: 2, zIndex: 10, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  Components
                </Typography>
                <IconButton onClick={toggleSidebar}>
                  <ChevronLeftIcon />
                </IconButton>
              </Box>

              <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {panelItems.map((item) => (
                  <Box
                    key={item.name}
                    onDragStart={(event) => onDragStart(event, item)}
                    draggable
                    sx={{ p: 1, border: '1px solid grey', m: 1, cursor: 'grab', userSelect: 'none' }}
                  >
                    {item.name}
                  </Box>
                ))}
              </Box>
              <Button
                variant="outlined"
                sx={
                  {
                    /* ...styles... */
                  }
                }
                onClick={() => {
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
              >
                Print code
              </Button>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Add Custom
                </Typography>
                <TextField
                  label="Component Name"
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
                  Add Component
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

      <Box sx={{ flexGrow: 1, height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            onNodeClick={(event, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
          >
            {!selectedNode && (
              <>
                <>
                  <IconButton
                    onClick={handleToggleFocusMode}
                    title="Toggle Focus Mode"
                    sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10, backgroundColor: 'white', boxShadow: 1 }}
                  >
                    {isFocusMode ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </>
              </>
            )}

            <Controls showLock={false} />

            {/* Cable Type Selection Menu */}
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
      </Box>
      <InspectorPanel node={selectedNode} onStyleChange={handleStyleChange} />
    </Box>
  );
}
