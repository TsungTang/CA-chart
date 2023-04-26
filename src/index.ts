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

const data2 = inputData.slice(0, 3);
const AbsMaximumValData2 = Math.max(...data2.map(d => Math.abs(d.value)));

horizontalBarChart({
  selector: '#horizontal_bar',
  width: 650,
  height: 500,
  data: inputData.slice(0, 3),
  xLabel: 'Here is X axis Label',
  yLabel: 'Here is Y axis Label',
  showBarText: true,
  highlightBar: d => d.value === AbsMaximumValData2 || d.value === -AbsMaximumValData2
});

const data3 = inputData.slice(0, 7);
const AbsMaximumValData3 = Math.max(...data3.map(d => Math.abs(d.value)));

verticalBarChart({
  selector: '#vertical_bar_force_symmetry',
  width: 650,
  height: 600,
  data: data3,
  xLabel: 'ershgsretherthdrhtershgsreetherthdrhtershgsretherthdrht',
  yLabel: '變項',
  forceSymmetry: true,
  showBarText: false,
  padding: 0.3,
  basedMargin: { bottom: 100 },
  barColor: d => (d.value > 0 ? '#4287f5' : '#f54242'),
  tooltipContent: d => {
    const isMaxEle = d.value === AbsMaximumValData3 || d.value === -AbsMaximumValData3;
    const maxEleNotify = isMaxEle ? `<div>影響力最大</div>` : '';
    return `${maxEleNotify}<div>${d.name}</div>
  <div>value: ${d.value.toPrecision(3)}</div>`;
  },
  highlightBar: d => d.value === AbsMaximumValData3 || d.value === -AbsMaximumValData3
});

appendTextToXTicks({
  selector: '#vertical_bar_force_symmetry .x-axis .tick',
  index: 0,
  label: 'testttt',
  textAttrs: { fill: 'white' },
  textBoxAttrs: { fill: 'blue' }
});
