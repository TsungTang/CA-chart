import * as d3 from 'd3';
import {
  TBarChartData,
  TBarColor,
  TBarColorFun,
  TDrawAxisParams,
  TAppendTextToYTicks
} from '../types';

type TComputedTextWidthConfig = {
  maxWidth: number;
  fontSize: CSSStyleDeclaration['fontSize'];
};

type TOutputData = {
  value: string;
  truncateText: string;
  textLen: number;
  width: number;
}[];

export const computedTextWidth = (
  data: string[],
  config: TComputedTextWidthConfig = { maxWidth: 500, fontSize: '15px' }
) => {
  const { maxWidth, fontSize } = config;
  /**
   *
   * @param {number|string} p
   */
  const checkTextWidth = p => {
    let testingText = '';
    if (typeof p === 'string') {
      testingText = p;
    } else {
      const formateFun = d3.format('.3f');
      testingText = formateFun(p); /** 非等寬字會不準 */
    }
    const templateEle = document.createElement('text');
    templateEle.style.fontSize = fontSize;
    templateEle.textContent = testingText;
    document.body.appendChild(templateEle);
    const textWidth = templateEle.offsetWidth;
    templateEle.remove();
    return textWidth;
  };
  const res = [];
  data.forEach(d => {
    let varText = d;

    const originalTextWidth = checkTextWidth(varText);
    let currTextWidth = originalTextWidth;
    /** currWidth must less than maxWidth */
    while (currTextWidth > maxWidth) {
      varText = `${varText.slice(0, -4)}..`;
      currTextWidth = checkTextWidth(varText);
    }
    res.push({
      value: d,
      truncateText: varText,
      textLen: varText.length,
      width: originalTextWidth
    });
  });
  const longestWidth = d3.max(res.map(d => d.width));
  return {
    longestWidth,
    fittedLongestWidth: longestWidth > maxWidth ? maxWidth : longestWidth,
    outputData: res as TOutputData
  };
};

type TYTextLabe = {
  f: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  content: string;
  height: number;
  marginLeft: number;
};

/*
 * y axis text label
 */
export const yTextLabel = ({ f, content, height, marginLeft }: TYTextLabe) => {
  // text label for the y axis
  f.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('class', 'y label')
    .attr('y', 0 - marginLeft)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text(content);
};

type TXTextLabel = {
  f: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  content: string;
  width: number;
  height: number;
  marginBottom: number;
  dy?: string | number;
};

/**
 * x axis text label*/
export const xTextLabel = ({ f, content, width, height, marginBottom, dy }: TXTextLabel) => {
  f.append('text')
    .attr('y', height + marginBottom + 30)
    .attr('x', width / 2)
    .attr('dy', dy ?? 15)
    .attr('class', 'x label')
    .style('text-anchor', 'middle')
    .text(content);
};

export const createBasicSVG = (
  selector: string,
  plot: { width: number; height: number },
  margin: { left: number; top: number; right: number; bottom: number }
) => {
  const svg = d3
    .select(selector)
    .append('svg')
    .attr('class', 'tukey-chart')
    .attr('width', plot.width + margin.left + margin.right)
    .attr('height', plot.height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  return svg;
};

export const generateBarFillColorFun = (barColor: TBarColor): TBarColorFun => {
  const hasSetBarColor = !!barColor;

  let barColorFill = (d: TBarChartData) => (d.value > 0 ? '#48B776' : '#FC5A62');
  if (!hasSetBarColor) return barColorFill;
  if (hasSetBarColor && typeof barColor === 'function') {
    return barColor;
  } else if (barColor.length === 2) {
    return (d: TBarChartData) => (d.value > 0 ? barColor[1] : barColor[0]);
  } else if (typeof barColor === 'string') {
    return (d: TBarChartData) => barColor;
  }
};

// TODO: add line type, stroke, ... in future
export const drawLine = (
  f: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  f.append('line')
    .style('stroke', '#555555')
    .style('stroke-width', 1)
    .style('stroke-dasharray', '10,5')
    .attr('x1', start.x)
    .attr('y1', start.y)
    .attr('x2', end.x)
    .attr('y2', end.y);
};

export const drawAxis = (params: TDrawAxisParams) => {
  const { f, axisCall, isXAxis, plotHeight } = params;

  f.append('g')
    .attr('transform', isXAxis ? `translate(0, ${plotHeight})` : '')
    .attr('class', `${isXAxis ? 'x' : 'y'}-axis`)
    .call(axisCall)
    .selectAll('text')
    .attr('class', `${isXAxis ? 'x' : 'y'}-text tick-text`)
    .attr('transform', isXAxis ? 'translate(-10,0)rotate(-45)' : '')
    .style('text-anchor', 'end');
};

const tooltipContainer = d3
  .select('body')
  .append('div')
  .attr('class', 'chart-tooltip')
  .style('opacity', 0);

export const addTooltips = <T extends d3.Selection<SVGRectElement, unknown, SVGGElement, unknown>>(
  f: T,
  contentFun: (d: any) => string
) => {
  f.on('mouseover', function (event, d) {
    tooltipContainer.transition().duration(200).style('opacity', 1);
    tooltipContainer
      .html(contentFun(d))
      .style('left', event.pageX + 'px')
      .style('top', event.pageY + 'px');
  }).on('mouseout', function (d) {
    tooltipContainer.transition().duration(500).style('opacity', 0);
  });
};

export const appendTextToXTicks = ({
  selector,
  index = 0,
  label,
  textAttrs,
  textBoxAttrs
}: TAppendTextToYTicks) => {
  const res = d3.selectAll(selector);

  const selection = d3.select(res.nodes()[index]);
  const BBox = (selection.node() as SVGSVGElement).getBBox();

  const textNode = selection
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', BBox.height)
    .attr('dy', '2em')
    .attr('font-size', '15px')
    .attr('font-weight', 700)
    .text(label);

  const TextBBox = textNode.node().getBBox();
  const TextBoxNode = selection
    .insert('rect', 'text')
    .attr('x', TextBBox.x - 10)
    .attr('y', TextBBox.y - 5)
    .attr('rx', 5)
    .attr('dy', '0.7em')
    .attr('fill', 'yellow')
    .attr('width', function (d) {
      return TextBBox.width + 20;
    })
    .attr('height', function (d) {
      return TextBBox.height + 10;
    });

  if (textAttrs) {
    Object.entries(textAttrs).forEach(([key, value]) => {
      textNode.attr(key, value);
    });
  }

  if (textBoxAttrs) {
    Object.entries(textBoxAttrs).forEach(([key, value]) => {
      TextBoxNode.attr(key, value);
    });
  }
};
