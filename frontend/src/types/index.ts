export type LanguageCode = 'en' | 'ta' | 'ml' | 'kn' | 'te' | 'mr' | 'hi';

export interface UserProfile {
  id?: number;
  name: string;
  phone: string;
  state: string;
  district: string;
  village?: string;
  pincode: string;
  preferred_lang: LanguageCode;
  farm_name?: string;
  farm_size_acres?: number;
  role: 'farmer' | 'manager' | 'admin';
}

export interface TelemetryReading {
  soil_raw: number | null;
  moisture: number | null;
  temperature: number | null;
  humidity: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  water_open: boolean;
  medicine_open: boolean;
  auto_water: boolean;
  timestamp?: string;
}

export interface DeviceStatus {
  status: 'ONLINE' | 'OFFLINE' | 'STALE' | 'WAITING_FOR_DATA' | 'DEMO';
  device_id: string;
  connected: boolean;
  seconds_ago?: number;
  last_seen?: string;
  reading: TelemetryReading | null;
}

export interface AiDiagnosisItem {
  crop: string;
  plant_part: string;
  health_status: 'Healthy' | 'Unhealthy' | 'Uncertain';
  disease_name?: string;
  confidence: number;
  symptoms?: string;
  scientific_recommendation?: string;
  home_remedy?: string;
  sources?: string;
  model_version: string;
  image_url?: string;
  timestamp: string;
}

export interface MultiImageDiagnosis {
  results: AiDiagnosisItem[];
  overall_health: 'Healthy' | 'Unhealthy' | 'Uncertain';
  summary: string;
}

export interface CropTask {
  id: number;
  crop: string;
  day_number: number;
  stage: string;
  title: string;
  irrigation_guide?: string;
  nutrient_management?: string;
  pest_scouting?: string;
  field_maintenance?: string;
  expected_observation?: string;
  completed: boolean;
  completed_at?: string | null;
}

export interface MarketCommodity {
  id: number;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  source: string;
  data_nature: string;
}

export interface YieldPredictionResult {
  crop: string;
  location: string;
  soil_type: string;
  sowing_month: string;
  area_acres: number;
  predicted_yield_per_acre: number;
  total_estimated_yield: number;
  confidence_range: {
    min_per_acre: number;
    max_per_acre: number;
  };
  suitability_score: string;
  growing_duration_days: number;
  limiting_factors: string[];
  water_nutrient_guidelines: string;
  pest_disease_risks: string;
  alternative_crops_comparison: Array<{
    crop: string;
    expected_yield_q_per_acre: number;
    duration_days: number;
    suitability: string;
  }>;
  model_version: string;
}

export interface RobotState {
  status: 'IDLE' | 'MOVING' | 'RUNNING_AUTONOMOUS' | 'RETURNING' | 'PAUSED' | 'EMERGENCY_STOP';
  mode: 'MANUAL' | 'AUTONOMOUS';
  x_pos: number;
  y_pos: number;
  heading_deg: number;
  distance_target_ft: number;
  distance_travelled_ft: number;
  battery_pct: number;
  solar_power_w: number;
  obstacle_detected: boolean;
  last_command: string;
  updated_at: string;
}

export interface AppNotification {
  id: number;
  type: 'SENSOR_ALERT' | 'DISEASE_ALERT' | 'VALVE_ACTION' | 'ROBOT_FAULT';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  created_at: string;
}

export interface AuditRecord {
  id: number;
  actor: string;
  action: string;
  category: 'IoT' | 'Hardware' | 'AI' | 'User' | 'Robot';
  details: string;
  timestamp: string;
}
