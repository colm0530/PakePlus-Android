export interface FeatureValue {
  name: string;
  value: number;
  importance: number;
  shapValue: number;
}

export interface ModelParams {
  rfTrees: number;
  rfDepth: number;
  xgbLearningRate: number;
  xgbMaxDepth: number;
  xgbSubsample: number;
}

export interface SampleData {
  id: number;
  location: string;
  dustConcentration: number;
  temp: number;
  humidity: number;
  uvIntensity: number;
  coatingType: string;
  degradationRate: number; // Target
}
