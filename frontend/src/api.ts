import axios from 'axios';
import type { DeliveryNode, AlgorithmType, AlgorithmResult, CompareResult } from './types';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export async function solveRoute(
  nodes: DeliveryNode[],
  algorithm: AlgorithmType
): Promise<AlgorithmResult> {
  const res = await API.post<AlgorithmResult>('/api/solve', { nodes, algorithm });
  return res.data;
}

export async function compareRoutes(nodes: DeliveryNode[]): Promise<CompareResult> {
  const res = await API.post<CompareResult>('/api/compare', { nodes });
  return res.data;
}

export async function healthCheck(): Promise<boolean> {
  try {
    await API.get('/api/health');
    return true;
  } catch {
    return false;
  }
}
