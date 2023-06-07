import type { TScatterChart } from '../../types';
import * as d3 from 'd3';
import { addTooltips, createBasicSVG } from '../../utils';

export const scatterChart = ({
  selector,
  width,
  height,
  basedMargin,
  data,
  tooltipContent,
  fillColor = '#61a3a9'
}: TScatterChart) => {
  const defaultMargin = { top: 20, right: 20, bottom: 50, left: 95 };
  const margin = { ...defaultMargin, ...basedMargin };

  const plotWidth = width - margin.left - 20;
  const plotHeight = height - margin.top - margin.bottom;

  const svg = createBasicSVG(selector, { width: plotWidth, height: plotHeight }, margin);

  const xValsDomain = [0, 0];
  const yValsDomain = [0, 0];
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    xValsDomain[0] = record.x < xValsDomain[0] ? record.x : xValsDomain[0];
    xValsDomain[1] = record.x >= xValsDomain[1] ? record.x : xValsDomain[1];

    yValsDomain[0] = record.y < yValsDomain[0] ? record.y : yValsDomain[0];
    yValsDomain[1] = record.y >= yValsDomain[1] ? record.y : yValsDomain[1];
  }
  // Add X Y axis
  const x = d3.scaleLinear().domain(xValsDomain).range([0, width]);
  const xAxis = svg
    .append('g')
    .attr('transform', 'translate(0,' + plotHeight + ')')
    .attr('class', `x-axis`)
    .call(d3.axisBottom(x).tickSizeOuter(0));
  xAxis.selectAll('text').attr('class', `x-text tick-text`).style('text-anchor', 'end');

  const y = d3.scaleLinear().domain(yValsDomain).range([plotHeight, 0]);
  const yAxis = svg.append('g').attr('class', `y-axis`).call(d3.axisLeft(y).tickSizeOuter(0));
  yAxis.selectAll('text').attr('class', `y-text tick-text`).style('text-anchor', 'end');

  /** scatter  */
  // Add a clipPath: everything out of this area won't be drawn.
  const clip = svg
    .append('defs')
    .append('SVG:clipPath')
    .attr('id', 'clip')
    .append('SVG:rect')
    .attr('width', plotWidth)
    .attr('height', plotHeight)
    .attr('x', 0)
    .attr('y', 0);
  const scatter = svg.append('g').attr('clip-path', 'url(#clip)');
  // Add circles
  scatter
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function (d) {
      return x(d.x);
    })
    .attr('cy', function (d) {
      return y(d.y);
    })
    .attr('r', 8)
    .style('fill', d => (typeof fillColor === 'string' ? fillColor : fillColor(d)))
    .call(sel => {
      if (tooltipContent) {
        addTooltips(sel, tooltipContent);
      }
    });

  const zoom = d3
    .zoom()
    .scaleExtent([1, 5])
    .extent([
      [0, 0],
      [plotWidth, plotHeight]
    ])
    .on('zoom', updateChart);

  svg
    .append('rect')
    .attr('width', plotWidth)
    .attr('height', plotHeight)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    // .lower()  //TODO tooltip 與 zoom會產生衝突， .lower -> zoom會在circle上失效；但若沒有 .lower 則無法 mouseover circle
    .call(zoom);

  function updateChart(event: any) {
    // recover the new scale
    var newX = event.transform.rescaleX(x);
    var newY = event.transform.rescaleY(y);

    // update axes with these new boundaries
    xAxis
      .call(d3.axisBottom(newX).tickSizeOuter(0))
      .selectAll('text')
      .attr('class', `x-text tick-text`)
      .style('text-anchor', 'end');
    yAxis
      .call(d3.axisLeft(newY).tickSizeOuter(0))
      .selectAll('text')
      .attr('class', `y-text tick-text`)
      .style('text-anchor', 'end');

    // update circle position
    scatter
      .selectAll('circle')
      .attr('cx', function (d: TScatterChart['data'][number]) {
        return newX(d.x);
      })
      .attr('cy', function (d: TScatterChart['data'][number]) {
        return newY(d.y);
      });
  }
};
