"""
Brute Force TSP Algorithm
-------------------------
Tries every permutation of nodes to find the exact optimal tour.
Time Complexity: O(n!) — only practical for n ≤ 10
"""

import itertools
import math
from typing import List, Tuple, Dict, Any


def euclidean_distance(a: dict, b: dict) -> float:
    return math.sqrt((a["x"] - b["x"]) ** 2 + (a["y"] - b["y"]) ** 2)


def build_distance_matrix(nodes: List[dict]) -> List[List[float]]:
    n = len(nodes)
    dist = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                dist[i][j] = euclidean_distance(nodes[i], nodes[j])
    return dist


def tour_length(tour: Tuple[int, ...], dist: List[List[float]]) -> float:
    total = 0.0
    for i in range(len(tour)):
        total += dist[tour[i]][tour[(i + 1) % len(tour)]]
    return total


def solve(nodes: List[dict]) -> Dict[str, Any]:
    """
    Returns the best tour found by brute force, plus step-by-step log.
    Steps include each permutation checked so the frontend can animate progress.
    """
    n = len(nodes)
    if n < 2:
        return {
            "route": [nodes[0]["id"]] if n == 1 else [],
            "total_distance": 0.0,
            "steps": [],
        }

    if n > 10:
        raise ValueError("Brute force is limited to 10 nodes to avoid timeout.")

    dist = build_distance_matrix(nodes)
    node_ids = [node["id"] for node in nodes]

    # Fix node 0 as start to cut permutations by factor of n
    others = list(range(1, n))
    best_tour = None
    best_dist = float("inf")
    steps = []

    checked = 0
    for perm in itertools.permutations(others):
        tour = (0,) + perm
        length = tour_length(tour, dist)
        checked += 1

        # Record every permutation for frontend (cap at 5000 steps to avoid huge payloads)
        if len(steps) < 5000:
            steps.append({
                "step": checked,
                "route": [node_ids[i] for i in tour],
                "distance": round(length, 4),
                "is_best": False,
            })

        if length < best_dist:
            best_dist = length
            best_tour = tour
            # mark the best in steps
            if steps:
                steps[-1]["is_best"] = True

    # close the loop
    final_route = [node_ids[i] for i in best_tour] + [node_ids[best_tour[0]]]

    return {
        "route": final_route,
        "total_distance": round(best_dist, 4),
        "steps": steps,
        "total_permutations_checked": checked,
    }
