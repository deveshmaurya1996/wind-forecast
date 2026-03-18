
export interface ActualPoint {
  startTime: string;  
  generation: number;
}

export interface ForecastPoint {
  startTime: string;
  publishTime: string;
  generation: number;
}

export interface ChartPoint {
  time: string;
  actual?: number;
  forecast?: number;
  label: string; 
}

export interface ChartDataResponse {
  series: ChartPoint[];
  error?: string;
}
