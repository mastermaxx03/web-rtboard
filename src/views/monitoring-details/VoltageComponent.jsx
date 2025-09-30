import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PurePhasorDiagram = ({ voltageR = 440, voltageY = 430, voltageB = 435, maxVoltage = 460, referenceVoltages = [375, 390, 440] }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 500;
    const margin = 30;
    const radius = (Math.min(width, height) - 2 * margin) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${centerX}, ${centerY})`);

    // Scales
    const radiusScale = d3.scaleLinear().domain([0, maxVoltage]).range([0, radius]);

    // Phase angles
    const phases = [{ angle: 0 }, { angle: 120 }, { angle: 240 }];

    // Dotted reference arcs in each sector
    phases.forEach((phase) => {
      const startAngle = ((phase.angle - 60 - 90) * Math.PI) / 180;
      const endAngle = ((phase.angle + 60 - 90) * Math.PI) / 180;

      referenceVoltages.forEach((voltage) => {
        const arcRadius = radiusScale(voltage);
        const x1 = arcRadius * Math.cos(startAngle);
        const y1 = arcRadius * Math.sin(startAngle);
        const x2 = arcRadius * Math.cos(endAngle);
        const y2 = arcRadius * Math.sin(endAngle);

        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
        const arcPath = `M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

        g.append('path')
          .attr('d', arcPath)
          .attr('fill', 'none')
          .attr('stroke', '#222')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
      });
    });

    // Outer circle
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radiusScale(maxVoltage))
      .attr('fill', 'none')
      .attr('stroke', '#222')
      .attr('stroke-width', 2);

    // Solid lines every 120°
    phases.forEach((phase) => {
      const angleRad = ((phase.angle - 90) * Math.PI) / 180;
      const x2 = radiusScale(maxVoltage) * Math.cos(angleRad);
      const y2 = radiusScale(maxVoltage) * Math.sin(angleRad);

      g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', x2).attr('y2', y2).attr('stroke', '#222').attr('stroke-width', 2);
    });

    // Center point
    g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 2).attr('fill', '#222');
  }, [voltageR, voltageY, voltageB, maxVoltage, referenceVoltages]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PurePhasorDiagram;
