export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  organization_id: number | null;
  permissions: string[];
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  code: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface Organization {
  id: number;
  name: string;
  code: string;
  timezone: string;
}

export interface Material {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  category: MaterialCategory;
  category_id?: number;
  base_unit: Unit;
  base_unit_id?: number;
  organization_id: number;
}

export interface MaterialCategory {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
}

export interface Unit {
  id: number;
  code: string;
  name: string;
  symbol: string;
  dimension?: string | null;
}

export interface Location {
  id: number;
  code: string;
  name: string;
  location_type: string;
  is_active: boolean;
}

export interface MaterialMovement {
  id: number;
  movement_number: string;
  movement_type: string;
  movement_date: string;
  status: 'draft' | 'posted' | 'reversed';
  reference_type?: string | null;
  reference_id?: number | null;
  created_by: number;
  posted_at: string | null;
  lines: MovementLine[];
}

export interface MovementLine {
  id: number;
  material: Material;
  material_id?: number;
  quantity: string | number;
  unit: Unit;
  unit_id?: number;
  from_location: Location | null;
  from_location_id?: number | null;
  to_location: Location | null;
  to_location_id?: number | null;
  unit_cost: string | null;
}

export interface ProductionRecord {
  id: number;
  production_number: string;
  process_code: string;
  production_date: string;
  status: 'draft' | 'finalized';
  created_by?: number;
  inputs: ProductionInput[];
  outputs: ProductionOutput[];
}

export interface ProductionInput {
  id: number;
  material: Material;
  material_id?: number;
  quantity: string | number;
  unit: Unit;
  unit_id?: number;
  source_movement_line_id?: number | null;
}

export interface ProductionOutput {
  id: number;
  output_name: string;
  output_type: 'product' | 'by_product' | 'waste';
  output_material: Material | null;
  output_material_id?: number | null;
  quantity: string | number;
  unit: Unit;
  unit_id?: number;
}

export interface MaterialBalance {
  material_id: number;
  material: Material;
  unit: string;
  opening: string | number;
  in: string | number;
  out: string | number;
  closing: string | number;
  period_start: string;
  period_end: string;
}

export interface MaterialFlow {
  id: number;
  flow_type: string;
  quantity: string | number;
  unit: Unit;
  source_entity_type?: string | null;
  source_entity_id?: number | null;
  calculation_version?: string | null;
  production_record?: ProductionRecord;
}

export interface MaterialLoss {
  id: number;
  loss_category: string;
  quantity: string | number;
  unit: Unit;
  valuation_amount?: string | number | null;
  method_version?: string | null;
  production_record_id?: number | null;
}

export interface MfcaAnalysis {
  id: number;
  analysis_number: string;
  period_start: string;
  period_end: string;
  scope_type: string;
  scope_id?: number | null;
  method_version: string;
  status: string;
  calculated_at: string | null;
  result_snapshot: Record<string, unknown> | null;
}

export interface Report {
  id: number;
  report_type: string;
  parameters: Record<string, unknown> | null;
  generated_at: string | null;
  status: string;
  file_path: string | null;
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  actor_user_id: number | null;
  ip_address: string | null;
  created_at: string;
  user?: User;
}

export interface DashboardSummary {
  total_materials: number;
  active_materials: number;
  total_movements_this_month: number;
  total_production_this_month: number;
  low_stock_materials: number;
}

export interface MovementTrendItem {
  date: string;
  movements_count: number;
  production_count: number;
}
