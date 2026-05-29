"""
Nearest Neighbor Greedy TSP Algorithm
--------------------------------------
Start at the first node, always travel to the nearest unvisited node.
Time Complexity: O(n²)
"""

import math
from typing import List, Dict, Any


def euclidean_distance(a: dict, b: dict) -> float:
    return math.sqrt((a["x"] - b["x"]) ** 2 + (a["y"] - b["y"]) ** 2)


def solve(nodes: List[dict]) -> Dict[str, Any]:
    """
    Greedy nearest neighbor starting from node index 0.
    Returns route, total distance, and step-by-step log.
    """
    n = len(nodes)
    if n < 2:
        return {
            "route": [nodes[0]["id"]] if n == 1 else [],
            "total_distance": 0.0,
            "steps": [],
        }

    node_ids = [node["id"] for node in nodes]
    visited = [False] * n
    route_indices = []
    steps = []

    current = 0
    visited[current] = True
    route_indices.append(current)
    total_dist = 0.0

    steps.append({
        "step": 0,
        "current_node": node_ids[current],
        "route_so_far": [node_ids[current]],
        "distance_so_far": 0.0,
        "action": "start",
    })

    for step in range(1, n):
        nearest = -1
        nearest_dist = float("inf")

        for j in range(n):
            if not visited[j]:
                d = euclidean_distance(nodes[current], nodes[j])
                if d < nearest_dist:
                    nearest_dist = d
                    nearest = j

        visited[nearest] = True
        total_dist += nearest_dist
        route_indices.append(nearest)
        current = nearest

        steps.append({
            "step": step,
            "current_node": node_ids[current],
            "route_so_far": [node_ids[i] for i in route_indices],
            "distance_so_far": round(total_dist, 4),
            "action": "visit",
        })

    # Return to start
    return_dist = euclidean_distance(nodes[route_indices[-1]], nodes[route_indices[0]])
    total_dist += return_dist
    final_route = [node_ids[i] for i in route_indices] + [node_ids[route_indices[0]]]

    steps.append({
        "step": n,
        "current_node": node_ids[route_indices[0]],
        "route_so_far": final_route,
        "distance_so_far": round(total_dist, 4),
        "action": "return_to_start",
    })

    return {
        "route": final_route,
        "total_distance": round(total_dist, 4),
        "steps": steps,
    }
