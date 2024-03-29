import type { BaseType, Selection } from 'd3';
import * as d3 from 'd3';

export type TSelectorType = BaseType | string;
export type TBarChartData = {
  name: string;
  value: number;
  nameTruncateText: string;
};

export type TScatterData = { x: number; y: number; index: number; group?: string };

export type TBarInputData = Omit<TBarChartData, 'nameTruncateText'>;

export type TBarColorFun = (d: TBarChartData) => string;

export type TBarColor = TBarColorFun | ([string, string] | string);

export type TDrawAxisParams = {
  f: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  axisCall: d3.Axis<string> | d3.Axis<d3.NumberValue>;
  isXAxis: boolean;
  plotHeight?: number;
};

export type TAppendTextToYTicks = {
  selector: string;
  index?: number;
  label: string;
  textAttrs?: Record<string, string | number>;
  textBoxAttrs?: Record<string, string | number>;
};

export type TBarChart = {
  selector: string;
  data: TBarInputData[];
  width: number;
  height: number;
  xLabel?: string;
  yLabel?: string;
  barColor?: TBarColor;
  showBarText?: boolean;
  forceSymmetry?: boolean;
  basedMargin?: { top?: number; right?: number; bottom?: number; left?: number };
  padding?: number;
  tooltipContent?: <T extends Record<string, any>>(d: TBarInputData & T, i?: number) => string;
  highlightBar?: number | number[] | ((params: TBarInputData, i?: number) => boolean);
  baseline?: number;
};

export type TVerticalBarChart = {
  xTickFormat?: (domainValue: string, index: number) => string;
  yTickFormat?: (domainValue: d3.NumberValue, index: number) => string;
} & TBarChart;

export type THorizontalBarChart = {
  xTickFormat?: (domainValue: d3.NumberValue, index: number) => string;
  yTickFormat?: (domainValue: string, index: number) => string;
} & TBarChart;

export type TScatterChart = {
  selector: string;
  data: TScatterData[];
  fillColor?: string | ((d: TScatterData) => string);
  width: number;
  height: number;
  basedMargin?: { top?: number; right?: number; bottom?: number; left?: number };
  tooltipContent?: <T extends Record<string, any>>(d: TScatterData & T, i?: number) => string;
};
