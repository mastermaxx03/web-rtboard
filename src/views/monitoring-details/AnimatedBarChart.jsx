// AnimatedBarChart.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './BarChart.css'; // Optional for styling

const AnimatedBarChart = ({ data, width = 600, height = 400 }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const tooltip = d3.select(tooltipRef.current);

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 100])
      .nice()
      .range([chartHeight, 0]);

    const chart = svg.attr('width', width).attr('height', height).append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    chart.append('g').attr('transform', `translate(0, ${chartHeight})`).call(d3.axisBottom(x));

    chart.append('g').call(d3.axisLeft(y));

    // Bars
    chart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.label))
      .attr('y', chartHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', '#69b3a2')
      .on('mouseover', function (event, d) {
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.label}</strong>: ${d.value}`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
        d3.select(this).attr('fill', '#40a3a2');
      })
      .on('mousemove', function (event) {
        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('opacity', 0);
        d3.select(this).attr('fill', '#69b3a2');
      })
      .transition()
      .duration(800)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => chartHeight - y(d.value));
  }, [data, height, width]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          padding: '5px 10px',
          borderRadius: '4px',
          pointerEvents: 'none',
          fontSize: '14px',
          opacity: 0
        }}
      ></div>
    </div>
  );
};

export default AnimatedBarChart;
