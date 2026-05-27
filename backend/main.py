"""
TSP Delivery Route Optimizer — FastAPI Backend
"""

import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import SolveRequest, AlgorithmResult, CompareRequest, CompareResponse
from algorithms import brute_force, nearest_neighbor, held_karp

app = FastAPI(
    title="TSP Route Optimizer API",
    description="Solves the Travelling Salesman Problem using Brute Force, Nearest Neighbor, and Held-Karp DP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def nodes_to_dicts(nodes):
    return [{"id": n.id, "x": n.x, "y": n.y, "label": n.label} for n in nodes]


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "TSP API is running"}


@app.post("/api/solve", response_model=AlgorithmResult)
def solve(request: SolveRequest):
    nodes = nodes_to_dicts(request.nodes)
    n = len(nodes)

    if n < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 nodes.")

    algo = request.algorithm.lower()

    try:
        start = time.perf_counter()

        if algo == "brute_force":
            if n > 10:
                raise HTTPException(
                    status_code=400,
                    detail=f"Brute Force is limited to 10 nodes (you have {n}). Use Nearest Neighbor or Held-Karp instead."
                )
            result = brute_force.solve(nodes)

        elif algo == "nearest_neighbor":
            result = nearest_neighbor.solve(nodes)

        elif algo == "held_karp":
            if n > 20:
                raise HTTPException(
                    status_code=400,
                    detail=f"Held-Karp is limited to 20 nodes (you have {n}). Use Nearest Neighbor for larger inputs."
                )
            result = held_karp.solve(nodes)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown algorithm '{algo}'. Choose from: brute_force, nearest_neighbor, held_karp"
            )

        elapsed_ms = (time.perf_counter() - start) * 1000

        return AlgorithmResult(
            algorithm=algo,
            route=result["route"],
            total_distance=result["total_distance"],
            computation_time_ms=round(elapsed_ms, 3),
            steps=result.get("steps", []),
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/api/compare", response_model=CompareResponse)
def compare(request: CompareRequest):
    """Run all applicable algorithms and return side-by-side results."""
    nodes_raw = nodes_to_dicts(request.nodes)
    n = len(nodes_raw)

    if n < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 nodes.")

    results = []
    algos = []

    if n <= 10:
        algos.append(("brute_force", brute_force.solve))
    algos.append(("nearest_neighbor", nearest_neighbor.solve))
    if n <= 20:
        algos.append(("held_karp", held_karp.solve))

    for name, fn in algos:
        try:
            start = time.perf_counter()
            res = fn(nodes_raw)
            elapsed_ms = (time.perf_counter() - start) * 1000
            results.append(AlgorithmResult(
                algorithm=name,
                route=res["route"],
                total_distance=res["total_distance"],
                computation_time_ms=round(elapsed_ms, 3),
                steps=res.get("steps", []),
            ))
        except Exception as e:
            results.append(AlgorithmResult(
                algorithm=name,
                route=[],
                total_distance=-1,
                computation_time_ms=0,
                steps=[],
            ))

    return CompareResponse(results=results)
