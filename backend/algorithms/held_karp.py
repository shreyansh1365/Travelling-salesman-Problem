"""
Held-Karp Dynamic Programming TSP Algorithm
--------------------------------------------
Exact optimal algorithm using bitmask DP.
Time Complexity: O(n² · 2ⁿ) — practical for n ≤ 20
Space Complexity: O(n · 2ⁿ)
"""

import math
from typing import List, Dict, Any


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


def solve(nodes: List[dict]) -> Dict[str, Any]:
    """
    Held-Karp exact TSP using bitmask DP.
    Returns optimal route, total distance, and DP table steps for visualization.
    """
    n = len(nodes)
    if n < 2:
        return {
            "route": [nodes[0]["id"]] if n == 1 else [],
            "total_distance": 0.0,
            "steps": [],
        }

    if n > 20:
        raise ValueError("Held-Karp is limited to 20 nodes due to exponential space.")

    node_ids = [node["id"] for node in nodes]
    dist = build_distance_matrix(nodes)

    INF = float("inf")
    FULL_MASK = (1 << n) - 1

    # dp[mask][i] = min cost to reach node i having visited exactly the nodes in `mask`
    # starting from node 0
    dp = [[INF] * n for _ in range(1 << n)]
    parent = [[-1] * n for _ in range(1 << n)]

    dp[1][0] = 0.0  # start at node 0, mask = 0b0001

    steps = []  # record notable DP updates for animation

    for mask in range(1, 1 << n):
        if not (mask & 1):  # must include starting node 0
            continue
        for u in range(n):
            if not (mask & (1 << u)):
                continue
            if dp[mask][u] == INF:
                continue
            # Expand to unvisited nodes
            for v in range(n):
                if mask & (1 << v):
                    continue
                new_mask = mask | (1 << v)
                new_cost = dp[mask][u] + dist[u][v]
                if new_cost < dp[new_mask][v]:
                    dp[new_mask][v] = new_cost
                    parent[new_mask][v] = u
                    # Record step for animation (cap at 2000)
                    if len(steps) < 2000:
                        steps.append({
                            "from_node": node_ids[u],
                            "to_node": node_ids[v],
                            "cost": round(new_cost, 4),
                            "mask": mask,
                            "new_mask": new_mask,
                        })

    # Find best last node to return to 0
    best_cost = INF
    last_node = -1
    for u in range(1, n):
        if dp[FULL_MASK][u] + dist[u][0] < best_cost:
            best_cost = dp[FULL_MASK][u] + dist[u][0]
            last_node = u

    # Backtrack to recover path
    path = []
    mask = FULL_MASK
    cur = last_node
    while cur != -1:
        path.append(cur)
        prev = parent[mask][cur]
        mask ^= (1 << cur)
        cur = prev
    path.reverse()
         #return to the starting ,if not best case 
    final_route = [node_ids[i] for i in path] + [node_ids[path[0]]]

    return {
        "route": final_route,
        "total_distance": round(best_cost, 4),
        "steps": steps,
        "dp_states_evaluated": sum(1 for mask in range(1 << n) for u in range(n) if dp[mask][u] != INF),
    }
