export type TBarChartData = {
  name: string;
  value: number;
  nameTruncateText: string;
};

export type TBarInputData = Omit<TBarChartData, 'nameTruncateText'>;

export type TBarColorFun = (d: TBarChartData) => string;

export type TBarColor = TBarColorFun | ([string, string] | string);

export type TDrawAxisParams = {
  f: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  axisCall: d3.Axis<d3.NumberValue | string>;
  isXAxis: boolean;
  plotHeight?: number;
};

export type TAppendTextToYTicks = {
  selector: string;
  index?: number;
  label: string;
  textAttrs?: Record<string, string>;
  textBoxAttrs?: Record<string, string>;
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
  padding?: number;
  tooltipContent?: <T extends Record<string, any>>(d: TBarInputData & T) => string;
};
