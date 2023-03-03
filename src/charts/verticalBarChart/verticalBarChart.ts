import * as d3 from 'd3';

import { TBarChart } from '../../types';

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

export const verticalBarChart = ({
  selector,
  data,
  width,
  height,
  xLabel,
  yLabel,
  barColor,
  showBarText = true,
  forceSymmetry = false,
  padding = 0.1,
  tooltipContent
}: TBarChart) => {
  // if (data.length > 10)
  //   throw new Error("Numbers of Bars shoud less or equal than 10");
  const { fittedLongestWidth, outputData } = computedTextWidth(
    data.map(d => d.name),
    {
      maxWidth: 200,
      fontSize: '15px'
    }
  );
  const hypotenuseLength = Math.sqrt(fittedLongestWidth ** 2 + fittedLongestWidth ** 2);
  const sideLength = hypotenuseLength / 2;
  const appendTruncateData = data.map((d, i) => ({
    ...d,
    nameTruncateText: outputData[i].truncateText
  }));
  const mb = sideLength + 50;
  const margin = { top: 20, right: 20, bottom: mb, left: 95 };
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
  };
  const xDomain = getXDomain();

  // Add X, y axis
  const y = d3.scaleLinear().domain(xDomain).range([plotHeight, 0]);

  const x = d3
    .scaleBand()
    .range([0, plotWidth])
    .domain(appendTruncateData.map(d => d.nameTruncateText))
    .padding(padding);

  // axis
  svg.call(f => drawAxis({ f, axisCall: d3.axisLeft(y).tickSizeOuter(0), isXAxis: false }));

  svg.call(f =>
    drawAxis({
      f,
      axisCall: d3.axisBottom(x).tickSizeOuter(0),
      isXAxis: true,
      plotHeight: plotHeight
    })
  );

  if (symmetryDomain) {
    svg.call(f => drawLine(f, { x: 0, y: y(0) }, { x: plotWidth, y: y(0) }));
  }

  //Bars
  const barFillColorFun = generateBarFillColorFun(barColor);

  svg
    .selectAll('chart-rect')
    .data(appendTruncateData)
    .enter()
    .append('rect')
    .attr('x', d => x(d.nameTruncateText))
    .attr('y', d => y(Math.max(d.value, 0)))
    .attr('width', d => x.bandwidth())
    .attr('height', d => Math.abs(y(d.value) - y(0)))
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
      .style('text-anchor', 'start')
      .text(d => {
        const prefix = d.value > 0 ? '+' : '-';
        const mainText = String(Math.abs(Math.round((d.value + Number.EPSILON) * 1000) / 1000));
        return `${prefix} ${mainText}`;
      })
      .attr('class', 'bar-text')
      .attr('dy', '-.5em')
      .attr('x', d => x(d.nameTruncateText) + x.bandwidth() / appendTruncateData.length)
      .attr('y', y(0));
  }

  // y axis label
  if (yLabel) {
    svg.call(() => yTextLabel(svg, yLabel, plotHeight, margin.left));
  }
  // X axis label:
  if (xLabel) {
    svg.call(() => xTextLabel(svg, xLabel, plotWidth, plotHeight, sideLength));
  }
};
