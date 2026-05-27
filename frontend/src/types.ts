export interface DeliveryNode {
  id: number;
  x: number;
  y: number;
  label: string;
}

export type AlgorithmType = 'brute_force' | 'nearest_neighbor' | 'held_karp';

export interface AlgorithmStep {
  step?: number;
  route?: number[];
  route_so_far?: number[];
  current_node?: number;
  distance_so_far?: number;
  distance?: number;
  is_best?: boolean;
  action?: string;
  from_node?: number;
  to_node?: number;
  cost?: number;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  route: number[];
  total_distance: number;
  computation_time_ms: number;
  steps: AlgorithmStep[];
}

export interface CompareResult {
  results: AlgorithmResult[];
}

export type AppMode = 'place' | 'solve' | 'compare' | 'animate';
