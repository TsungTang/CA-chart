import * as d3 from 'd3';

import { TVerticalBarChart } from '../../types';

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
import svgFile from '../../svg/Polygon.svg';

export const verticalBarChart = ({
  selector,
  data,
  width,
  height,
  xLabel,
  yLabel,
  barColor = '#ddd',
  basedMargin,
  xTickFormat = d => d,
  yTickFormat = d => d.toString(),
  showBarText = true,
  forceSymmetry = false,
  padding = 0.1,
  tooltipContent,
  highlightBar
}: TVerticalBarChart) => {
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
    index: i,
    nameTruncateText: outputData[i].truncateText
  }));

  const defaultMargin = { top: 20, right: 20, bottom: 50, left: 95 };
  const margin = { ...defaultMargin, ...basedMargin };
  const mbAddSideLen = sideLength + margin.bottom;
  margin.bottom = mbAddSideLen;

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
    svg.call(f => drawLine(f, { x: 0, y: y(0) }, { x: plotWidth, y: y(0) }));
  }

  //Bars
  const barFillColorFun = generateBarFillColorFun(barColor);

  svg
    .selectAll('chart-rect')
    .data(appendTruncateData)
    .enter()
    .append('rect')
    .attr('class', 'chart-bar')
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
      .attr('class', 'highlight-icon')
      .style('transform', d => `translateY(${-16}px)`)
      .attr('x', d => x(d.nameTruncateText) + x.bandwidth() / 2 - 6)
      .attr('y', d => (d.value < 0 ? y(0) : Math.abs(y(d.value))));
  }

  // y axis label
  if (yLabel) {
    svg.call(() =>
      yTextLabel({ f: svg, content: yLabel, height: plotHeight, marginLeft: margin.left })
    );
  }
  // X axis label:
  if (xLabel) {
    const dy = basedMargin?.bottom ? basedMargin.bottom - defaultMargin.bottom : undefined;
    svg.call(() =>
      xTextLabel({
        f: svg,
        content: xLabel,
        width: plotWidth,
        height: plotHeight,
        marginBottom: sideLength,
        dy
      })
    );
  }
};
