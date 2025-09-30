import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { MiniMap, Controls, getBezierPath, getSmoothStepPath } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import './allMachines.css';
import { FiMaximize, FiMinimize } from 'react-icons/fi'; // Add this for icons

import { COLORS, nodeWidth, nodeHeight } from '../../utils/flowConfig';

const S3_HIERARCHY_URL = 'https://iot-poc-001.s3.ap-south-1.amazonaws.com/hierarchyData2.json';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
dagreGraph.setGraph({ rankdir: 'TB' }); // Top to Bottom

// Corrected and optimized hierarchy structure
const DoubleLineEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, data }) => {
  // Dynamic offset for vertical/horizontal
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy);
  let offset = 4;
  if (Math.abs(dx) < Math.abs(dy)) offset = 4;
  const nx = -dy / len;
  const ny = dx / len;

  const [edgePath1] = getSmoothStepPath({
    sourceX: sourceX + nx * offset,
    sourceY: sourceY + ny * offset,
    targetX: targetX + nx * offset,
    targetY: targetY + ny * offset
  });
  const [edgePath2] = getSmoothStepPath({
    sourceX: sourceX - nx * offset,
    sourceY: sourceY - ny * offset,
    targetX: targetX - nx * offset,
    targetY: targetY - ny * offset
  });

  // Calculate label position (midpoint)
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <g>
      <path id={id + '-1'} style={{ ...style, strokeWidth: 1 }} className="react-flow__edge-path" d={edgePath1} markerEnd={markerEnd} />
      <path id={id + '-2'} style={{ ...style, strokeWidth: 1 }} className="react-flow__edge-path" d={edgePath2} markerEnd={markerEnd} />
      <text
        x={labelX}
        y={labelY - 8}
        textAnchor="middle"
        style={{
          fontSize: 14,
          fill: '#333',
          fontWeight: 600,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        {data?.label || ''}
      </text>
    </g>
  );
};

const edgeTypes = {
  doubleLine: DoubleLineEdge
};

// const hierarchyData

function buildGraph(tree, parent = null, nodes = [], edges = [], color = null) {
  if (!tree || !tree.id) {
    console.error('Skipping invalid node in hierarchy:', tree);
    return { nodes, edges }; // Safely skip this invalid entry
  }
  let feederColor = color;
  if (tree.id.startsWith('feeder')) feederColor = COLORS[tree.id] || null;

  var style = feederColor ? { backgroundColor: feederColor, color: 'black' } : {};

  // Append specific styles for rmu
  if (tree.id === 'rmu') {
    style = {
      ...style,
      backgroundColor: '#FFFF00', // Yellow background
      color: 'black' // black text
    };
  }

  // Append specific styles for rmupanel
  if (tree.id === 'rmupanel') {
    style = {
      ...style,
      width: 80, // Smaller width
      height: 30, // Smaller height
      fontSize: 10 // Smaller font size
    };
  }

  // Append specific styles for rmupanel
  if (tree.id === 'transformer1') {
    style = {
      ...style,
      backgroundColor: '#CCE5FF', // Yellow background
      color: 'black' // black text
    };
  }

  // Append specific styles for rmupanel
  if (tree.id === 'transformer2') {
    style = {
      ...style,
      backgroundColor: '#FFCC99', // Yellow background
      color: 'black' // black text
    };
  }

  const node = {
    id: tree.id,
    data: { label: tree.label, mongoId: tree.mongoId || tree.id },
    style,
    position: { x: 0, y: 0 },
    type: 'default'
  };
  nodes.push(node);

  // if (parent) {
  //   edges.push({ id: `${parent}-${tree.id}`, source: parent, target: tree.id });
  // }

  // if (parent && tree.id !== 'rmupanel') {
  //   // Add edges for all nodes except rmupanel
  //   edges.push({
  //     id: `${parent}-${tree.id}`,
  //     source: parent,
  //     target: tree.id
  //     // type: "smoothstep",
  //   });
  // }

  if (parent && tree.id !== 'rmupanel') {
    // Double edge for rmu to htpanel
    if (
      (parent === 'rmu' && tree.id === 'htpanel') ||
      (parent === 'htpanel' && (tree.id === 'transformer1' || tree.id === 'transformer2'))
    ) {
      edges.push({
        id: `${parent}-${tree.id}-double`,
        source: parent,
        target: tree.id,
        type: 'doubleLine',
        data: { label: 'HT Cable' }
      });
    } else {
      edges.push({
        id: `${parent}-${tree.id}`,
        source: parent,
        target: tree.id
      });
    }
  }

  // Add a specific edge from rmupanel to rmu
  if (tree.id === 'rmupanel') {
    edges.push({
      id: 'rmupanel-to-rmu',
      source: 'rmupanel',
      target: 'rmu',
      type: 'smoothstep' // Optional: Use a smooth curve for the edge
    });
  }

  if (tree.children) {
    for (const child of tree.children) {
      buildGraph(child, tree.id, nodes, edges, feederColor);
    }
  }

  return { nodes, edges };
}

function layoutElementsWithRowWrap(nodes, edges, maxPerRow = 3) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 40, // less space between siblings
    ranksep: 50, // less vertical space

    // align: "UL", // align to Upper-Left instead of center
    ranker: 'tight-tree' // tries to keep layout compact
  }); // Top to Bottom
  g.setDefaultEdgeLabel(() => ({}));

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const node of nodes) {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  console.log('All node IDs:', g.nodes());

  const feeder1 = g.node('feeder1');
  const feeder2 = g.node('feeder2');
  const feeder3 = g.node('feeder3');
  const feeder4 = g.node('feeder4');

  const transformer1 = g.node('transformer1');
  const transformer2 = g.node('transformer2');
  const ltincomer1 = g.node('ltincomer1');
  const ltincomer2 = g.node('ltincomer2');

  feeder1.x = feeder1.x + 1200; // shift right slightly
  feeder2.x = feeder2.x + 150; // shift left slightly

  feeder3.x = feeder3.x - 700; // shift right slightly
  feeder4.x = feeder4.x - 1200; // shift left slightly

  transformer1.x = transformer1.x + 700; // shift right slightly
  transformer2.x = transformer2.x - 1000; // shift left slightly
  ltincomer1.x = ltincomer1.x + 700; // shift right slightly
  ltincomer2.x = ltincomer2.x - 1000; // shift left slightly

  const rmu = g.node('rmu');
  const rmupanel = g.node('rmupanel');

  // Position rmupanel strictly to the right of rmu
  if (rmu && rmupanel) {
    rmupanel.x = rmu.x + 300; // Adjust the value to control the horizontal distance
    rmupanel.y = rmu.y; // Align vertically with rmu
  }

  const groupedChildren = {};

  // Group by parent
  edges.forEach((edge) => {
    if (!groupedChildren[edge.source]) groupedChildren[edge.source] = [];
    groupedChildren[edge.source].push(edge.target);
  });

  for (const [parentId, childIds] of Object.entries(groupedChildren)) {
    if (childIds.length > maxPerRow) {
      // Wrap children in rows
      const parentNode = g.node(parentId);
      const baseX = parentNode.x;
      const baseY = parentNode.y + 100;

      childIds.forEach((childId, idx) => {
        const col = idx % maxPerRow;
        const row = Math.floor(idx / maxPerRow);

        const childNode = g.node(childId);
        childNode.x = baseX + (col - Math.floor(maxPerRow / 2)) * (nodeWidth + 40);
        childNode.y = baseY + row * (nodeHeight + 50);
      });
    }
  }

  return nodes.map((node) => {
    const pos = g.node(node.id);
    node.position = {
      x: pos.x - nodeWidth / 2,
      y: pos.y - nodeHeight / 2
    };
    return node;
  });
}

const MyIndustryFlow = () => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState(null); // State to manage context menu
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state
  const [hierarchyData, setHierarchyData] = useState(null);

  // Fetch hierarchy from S3
  useEffect(() => {
    fetch(S3_HIERARCHY_URL)
      .then((res) => res.json())
      .then((data) => setHierarchyData(data))
      .catch((err) => {
        console.error('Failed to load hierarchy from S3:', err);
      });
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!hierarchyData) return { nodes: [], edges: [] };
    const { nodes, edges } = buildGraph(hierarchyData);
    console.log('Nodes being sent to layout:', JSON.stringify(nodes, null, 2));

    const laidOutNodes = layoutElementsWithRowWrap(nodes, edges);
    return { nodes: laidOutNodes, edges };
  }, [hierarchyData]);

  // const { nodes, edges } = useMemo(() => {
  //   const { nodes, edges } = buildGraph(hierarchyData);
  //   // const laidOutNodes = layoutElements(nodes, edges);

  //   const laidOutNodes = layoutElementsWithRowWrap(nodes, edges);

  //   return { nodes: laidOutNodes, edges };
  // }, []);

  const handleNodeDoubleClick = (event, node) => {
    // const machineId = node.id;
    const machineId = node.data.mongoId;
    console.log('Node double-clicked:', machineId);
    // navigate(`/machine/${machineId}`);
    navigate(`/rtmonitoring/${machineId}`);
  };

  const handleNodeContextMenu = (event, node) => {
    event.preventDefault(); // Prevent the default context menu
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      node
    });
  };

  const handleMenuOptionClick = (option) => {
    console.log(`Option selected: ${option} for node:`, contextMenu.node);
    setContextMenu(null); // Close the context menu
    if (option === 'Real-Time Monitoring') {
      navigate(`/rtmonitoring/${contextMenu.node.data.mongoId}`);
    } else if (option === 'Machine Monitoring') {
      navigate(`/himonitoring/${contextMenu.node.data.mongoId}`);
    } else if (option === 'Alerts') {
      navigate(`/alerts/${contextMenu.node.data.mongoId}`);
    }
  };

  const handlePaneClick = () => {
    setContextMenu(null); // Close the context menu when clicking outside
  };

  const handleContextMenu = (event) => {
    event.preventDefault(); // Disable the system context menu for the entire React Flow area
  };

  const handleEdgeDoubleClick = (event, edge) => {
    console.log('Edge double-clicked:', edge);
  };

  const handleNodeClick = (event, node) => {
    console.log('Node clicked:', node);
  };

  const handleEdgeClick = (event, edge) => {
    console.log('Edge clicked:', edge);
  };

  const handleEdgeContextMenu = (event, edge) => {
    event.preventDefault(); // Prevent the default context menu
    console.log('Edge right-clicked:', edge);
  };

  const handlePaneContextMenu = (event) => {
    event.preventDefault(); // Prevent the default context menu
    console.log('Pane right-clicked');
  };

  return (
    <div
      style={{
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '75vh',
        position: isFullscreen ? 'fixed' : 'relative', // <-- key change
        background: '#f8f8f8',
        zIndex: isFullscreen ? 2000 : 'auto',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        transition: 'all 0.3s'
      }}
      onContextMenu={handleContextMenu}
    >
      <button
        onClick={() => setIsFullscreen((prev) => !prev)}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1100,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer'
        }}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
      </button>

      {isFullscreen && contextMenu && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
            background: '#ffffff',
            boxShadow: '0 1px 10px rgb(0 0 0 / 0.5)',
            borderRadius: '4px',
            zIndex: 1000,
            padding: '5px 0',
            minWidth: '250px'
            // border: "1px solid #e0e0e0",
          }}
        >
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0
            }}
          >
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                // borderBottom: "1px solid #e4e4e4",
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target.style.background = '#e4e4e4')}
              onMouseLeave={(e) => (e.target.style.background = 'transparent')}
              onClick={() => handleMenuOptionClick('Real-Time Monitoring')}
            >
              <span style={{ marginRight: '10px' }}>📊</span> {/* Icon */}
              Real-Time Monitoring
            </li>
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                // borderBottom: "1px solid #e4e4e4",
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target.style.background = '#e4e4e4')}
              onMouseLeave={(e) => (e.target.style.background = 'transparent')}
              onClick={() => handleMenuOptionClick('Machine Monitoring')}
            >
              <span style={{ marginRight: '10px' }}>🛠️</span> {/* Icon */}
              Machine Monitoring
            </li>

            <li
              style={{
                position: 'relative', // Required for submenu positioning
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Align text and icon
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                // borderBottom: "1px solid #e4e4e4",
                transition: 'background 0.2s ease'
              }}
              className="alerts-menu"
              onMouseEnter={(e) => (e.target.style.background = '#e4e4e4')}
              onMouseLeave={(e) => (e.target.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>⚠️</span> {/* Icon */}
                Alerts
              </div>
              <span style={{ fontSize: '12px', color: '#999' }}>▶</span> {/* Dropdown Icon */}
              <ul
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '100%',
                  background: '#ffffff',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  zIndex: 10,
                  padding: '5px 0',
                  minWidth: '180px'
                  // border: "1px solid #e4e4e4",
                  // display: "none",
                }}
                className="submenu"
              >
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target.style.background = '#e4e4e4')}
                  onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  onClick={() => handleMenuOptionClick('Maintenance')}
                >
                  <span style={{ marginRight: '10px' }}>🔧</span> {/* Icon */}
                  Critical
                </li>

                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target.style.background = '#e4e4e4')}
                  onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                  onClick={() => handleMenuOptionClick('Maintenance')}
                >
                  <span style={{ marginRight: '10px' }}>🔧</span> {/* Icon */}
                  Normal
                </li>
              </ul>
            </li>

            {/* <li
              style={{
                padding: "10px 15px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#ff0000",
                transition: "background 0.2s ease",
                textAlign: "center",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#ffe5e5")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
              onClick={() => setContextMenu(null)} // Close the menu
            >
              Cancel
            </li> */}
            {/* <li
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 15px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#ff0000",
                transition: "background 0.2s ease",
                textAlign: "center",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#ffe5e5")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
              onClick={() => setContextMenu(null)}
            >
              <span style={{ marginRight: "10px" }}>❌</span>
              Cancel
            </li> */}
          </ul>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition={false}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu} // Attach right-click event
        onPaneClick={handlePaneClick} // Close context menu on pane click
        onPaneScroll={handlePaneClick} // Close context menu on pane scroll
        edgeTypes={edgeTypes}
      >
        {/* <MiniMap /> */}
        <Controls showInteractive={false} style={{ background: 'white', borderRadius: '5px' }} />
      </ReactFlow>
    </div>
  );
};

export default MyIndustryFlow;
