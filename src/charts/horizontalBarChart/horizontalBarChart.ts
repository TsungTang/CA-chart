import * as d3 from 'd3';
import { TBarChartData, TBarColor, TBarInputData } from '../../types';
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
type TBarChart = {
  selector: string;
  data: TBarInputData[];
  width: number;
  height: number;
  xLabel?: string;
  yLabel?: string;
  barColor?: TBarColor;
  showBarText?: boolean;
  forceSymmetry?: boolean;
  padding?: number;
  tooltipContent?: <T extends Record<string, any>>(d: TBarInputData & T) => string;
};

export const horizontalBarChart = ({
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
  if (data.length > 10) throw new Error('Numbers of Bars shoud less or equal than 10');
  const { fittedLongestWidth, outputData } = computedTextWidth(
    data.map(d => d.name),
    {
      maxWidth: 200,
      fontSize: '15px'
    }
  );

  const appendTruncateData: TBarChartData[] = data.map((d, i) => ({
    ...d,
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
