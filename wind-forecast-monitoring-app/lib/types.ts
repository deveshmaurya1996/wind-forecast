
export interface ElexonActualRecord {
  startTime: string;     
  settlementDate?: string;
  settlementPeriod?: number;
  fuelType: string;       
  generation: number;       
}

export interface ElexonForecastRecord {
  startTime:   string;   
  publishTime: string;   
  generation:  number;   
}

export interface ActualPoint {
  startTime:  string;
  generation: number;
}

export interface ForecastPoint {
  startTime:   string;
  publishTime: string;
  generation:  number;
  fhHours:     number;   
}

export interface ChartRow {
  startTime:  string;          
  actual?:    number | null;
  forecast?:  number | null;
  fhHours?:   number;
}

export interface ChartApiResponse {
  rows:    ChartRow[];
  metrics: ChartMetrics;
}

export interface ChartMetrics {
  mae:    number | null;
  rmse:   number | null;
  mape:   number | null;
  bias:   number | null;
  count:  number;           
}