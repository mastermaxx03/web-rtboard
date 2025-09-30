import React from 'react';

import ReactECharts from 'echarts-for-react';



// ---- ECharts modular (tree-shaken) imports ----

import * as echarts from 'echarts/core';

import { PieChart, BarChart } from 'echarts/charts';

import { PolarComponent } from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, BarChart, PolarComponent, CanvasRenderer]);



// ---- Config ----

const MAX_VOLT = 500; // The maximum value for the chart's scale

const NAMES = ['VRY', 'VYB', 'VBR'];

const SOLID_COLORS = [
    '#ff5252', // VRY
    '#ffce56', // VYB
    '#36a2eb'  // VBR
  ];



// Helper function to create the dashed guide rings

const dashedRingSeries = (radiusPct, color) => ({

type: 'pie',

silent: true,

radius: [`${radiusPct - 0.6}%`, `${radiusPct}%`],

center: ['50%', '50%'],

label: { show: false },

labelLine: { show: false },

hoverAnimation: false,

data: [{ value: 100, itemStyle: { color: 'transparent', borderColor: color, borderWidth: 1, borderType: 'dashed' } }],

z: 1

});



// ID: DB-PC-EC-01

export default function PhasorChartSeg(props) {

// This component is "dumb" - it receives its data from its parent.

// We provide a default empty array to prevent errors.

const { volts = [] } = props;



const phasorOption = {

animationDuration: 250,
tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}V' // {b} is the name (VRY), {c} is the value
  },

polar: { radius: [0, '86%'] },

angleAxis: {

type: 'category',

data: NAMES,

startAngle: 90,

axisLine: { show: false },

axisTick: { show: false },

axisLabel: { show: false },

splitLine: { show: false }

},

radiusAxis: {

type: 'value',

min: 0,

max: MAX_VOLT,

axisLine: { show: false },

axisTick: { show: false },

axisLabel: { show: false },

splitLine: { show: false }

},

series: [



{

type: 'bar',

coordinateSystem: 'polar',

data: volts.map((v, i) => ({
value: v,
name: NAMES[i],

itemStyle: {
    color: SOLID_COLORS[i],
   

borderColor: '#fff',

borderWidth: 2

}

})),

barCategoryGap: '0%',

barGap: '0%',

z: 2

}

]

};



return <ReactECharts echarts={echarts} option={phasorOption} notMerge lazyUpdate style={{ height: '100%', width: '100%' }} />;

} 