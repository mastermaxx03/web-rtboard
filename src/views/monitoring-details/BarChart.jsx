// BarChart.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, width = 500, height = 300 }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, chartWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([chartHeight, 0]);

    const chart = svg.attr('width', width).attr('height', height).append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    chart.append('g').attr('transform', `translate(0,${chartHeight})`).call(d3.axisBottom(x));

    // Y axis
    chart.append('g').call(d3.axisLeft(y));

    // Bars
    chart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.label))
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => chartHeight - y(d.value))
      .attr('fill', '#69b3a2');
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;
