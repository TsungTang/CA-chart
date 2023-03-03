import { inputData } from './datas';
import './tukey-chart.css';
import { horizontalBarChart, verticalBarChart } from './charts';
import { appendTextToXTicks } from './utils';

verticalBarChart({
  selector: '#vertical_bar',
  width: 650,
  height: 600,
  data: inputData.slice(0, 5),
  xLabel: 'Here is X axis Label',
  yLabel: 'Here is Y axis Label',
  showBarText: false,
  padding: 0.9,
  barColor: d => (d.value > 0 ? '#bbffff' : '#ffbbdd'),
  tooltipContent: d => `<div>${d.name}</div>
  <div>value: ${d.value.toPrecision(3)}</div>`
});

horizontalBarChart({
  selector: '#horizontal_bar',
  width: 650,
  height: 500,
  data: inputData.slice(0, 3),
  xLabel: 'Here is X axis Label',
  yLabel: 'Here is Y axis Label',
  showBarText: true
});

verticalBarChart({
  selector: '#vertical_bar_force_symmetry',
  width: 650,
  height: 600,
  data: inputData.slice(0, 3),
  xLabel: 'ershgsretherthdrhtershgsreetherthdrhtershgsretherthdrht',
  yLabel: '變項',
  forceSymmetry: true,
  showBarText: false,
  padding: 0.9,
  basedMargin: { bottom: 90 },
  barColor: d => (d.value > 0 ? '#bbffff' : '#ffbbdd'),
  tooltipContent: d => `<div>${d.name}</div>
  <div>value: ${d.value.toPrecision(3)}</div>`
});

appendTextToXTicks({
  selector: '#vertical_bar_force_symmetry .x-axis .tick',
  label: 'testttt',
  textAttrs: { fill: 'white' },
  textBoxAttrs: { fill: 'blue' }
});
