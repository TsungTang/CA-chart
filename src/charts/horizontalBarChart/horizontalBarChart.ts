import * as d3 from 'd3';
import { THorizontalBarChart } from '../../types';
import {
  computedTextWidth,
  yTextLabel,
  xTextLabel,
  createBasicSVG,
  generateBarFillColorFun,
  drawLine,
  drawAxis,
  addTooltips
} from '../../utils';
import svgFile from '../../svg/Polygon-90.svg';

export const horizontalBarChart = ({
  selector,
  data,
  width,
  height,
  xLabel,
  yLabel,
  barColor = '#ddd',
  showBarText = true,
  forceSymmetry = false,
  padding = 0.1,
  tooltipContent,
  highlightBar,
  xTickFormat = d => d.toString(),
  yTickFormat = d => d
}: THorizontalBarChart) => {
  if (data.length > 10) throw new Error('Numbers of Bars shoud less or equal than 10');
  const { fittedLongestWidth, outputData } = computedTextWidth(
    data.map(d => d.name),
    {
      maxWidth: 200,
      fontSize: '15px'
    }
  );

  const appendTruncateData = data.map((d, i) => ({
    ...d,
    index: i,
    nameTruncateText: outputData[i].truncateText
  }));
  const ml = fittedLongestWidth + 35;
  const margin = { top: 20, right: 20, bottom: 70, left: ml };
  const plotWidth = width - margin.left - 20;
  const plotHeight = height - margin.top - margin.bottom;

  const svg = createBasicSVG(selector, { width: plotWidth, height: plotHeight }, margin);

  const allNagativeVal = data.every(d => d.value < 0);
  const allPositiveVal = data.every(d => d.value > 0);
  const mixPositiveNaativeVal = !allNagativeVal && !allPositiveVal;
  const symmetryDomain = mixPositiveNaativeVal || forceSymmetry;
  const maximumVal = Math.max.apply(
    null,
    appendTruncateData.map(d => Math.abs(d.value))
  );

  const getXDomain = () => {
    if (symmetryDomain) return [-maximumVal, maximumVal];
    if (allNagativeVal) return [-maximumVal, 0];
    if (allPositiveVal) return [0, maximumVal];
    return [-maximumVal, maximumVal];
  };
  const xDomain = getXDomain();

  // Add X, y axis
  const x = d3.scaleLinear().domain(xDomain).range([0, plotWidth]);

  const y = d3
    .scaleBand()
    .range([0, plotHeight])
    .domain(appendTruncateData.map(d => d.nameTruncateText))
    .padding(padding);

  // axis
  svg.call(f =>
    drawAxis({
      f,
      axisCall: d3.axisLeft(y).tickSizeOuter(0).tickFormat(yTickFormat),
      isXAxis: false
    })
  );
  svg.call(f =>
    drawAxis({
      f,
      axisCall: d3.axisBottom(x).tickSizeOuter(0).tickFormat(xTickFormat),
      isXAxis: true,
      plotHeight: plotHeight
    })
  );

  if (symmetryDomain) {
    svg.call(f => drawLine(f, { x: x(0), y: 0 }, { x: x(0), y: plotHeight }));
  }

  //Bars
  const barFillColorFun = generateBarFillColorFun(barColor);
  svg
    .selectAll('chart-rect')
    .data(appendTruncateData)
    .enter()
    .append('rect')
    .attr('x', d => x(Math.min(d.value, 0)))
    .attr('y', d => y(d.nameTruncateText))
    .attr('width', d => Math.abs(x(d.value) - x(0)))
    .attr('height', y.bandwidth())
    .attr('fill', barFillColorFun)
    .call(sel => {
      if (tooltipContent) {
        addTooltips(sel, tooltipContent);
      }
    });

  if (showBarText) {
    svg
      .selectAll('chart-rect')
      .data(appendTruncateData)
      .enter()
      .append('text')
      .text(d => {
        const prefix = d.value > 0 ? '+' : '-';
        const mainText = String(Math.abs(Math.round((d.value + Number.EPSILON) * 1000) / 1000));
        return `${prefix} ${mainText}`;
      })
      .attr('class', 'bar-text')
      .attr('dx', '.5em')
      .attr('x', x(0))
      .attr('y', d => y(d.nameTruncateText) + y.bandwidth() / 2);
  }

  if (highlightBar) {
    svg
      .selectAll('chart-rect')
      .data(appendTruncateData)
      .enter()
      .append('svg:image')
      .attr('xlink:href', svgFile)
      .attr('width', 12)
      .attr('height', 12)
      .style('display', (d, i) => {
        let show = false;
        if (typeof highlightBar === 'number') {
          show = i === highlightBar;
        } else if (Array.isArray(highlightBar)) {
          show = highlightBar.includes(i);
        } else {
          show = highlightBar(d, i);
        }
        return show ? '' : 'none';
      })
      .attr('x', d => (d.value > 0 ? x(d.value) : x(0)))
      .attr('y', d => y(d.nameTruncateText) + y.bandwidth() / 2 - 6)
      .attr('class', 'highlight-icon')
      .style('transform', d => `translateX(${4}px)`);
  }

  // y axis label
  if (yLabel) {
    svg.call(() =>
      yTextLabel({ f: svg, content: yLabel, height: plotHeight, marginLeft: margin.left })
    );
  }

  // X axis label:
  if (xLabel) {
    svg.call(() =>
      xTextLabel({
        f: svg,
        content: xLabel,
        width: plotWidth,
        height: plotHeight,
        marginBottom: margin.top
      })
    );
  }
};
