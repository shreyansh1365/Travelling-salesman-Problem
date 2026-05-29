from pydantic import BaseModel
from typing import List, Optional

class Node(BaseModel):
    id: int
    x: float
    y: float
    label: Optional[str] = None

class SolveRequest(BaseModel):
    nodes: List[Node]
    algorithm: str  # "brute_force" | "nearest_neighbor" | "held_karp"

class AlgorithmResult(BaseModel):
    algorithm: str
    route: List[int]          # ordered node ids
    total_distance: float
    computation_time_ms: float
    steps: Optional[List[dict]] = None   # for animation / step-by-step

class CompareRequest(BaseModel):
    nodes: List[Node]

class CompareResponse(BaseModel):
    results: List[AlgorithmResult]
