# 🗺 TSP Solver — Travelling Salesman Problem Visualizer

> An interactive, full-stack visualizer for the **Travelling Salesman Problem (TSP)** — one of the most famous **NP-Hard** combinatorial optimization problems in computer science.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)

---

## 🧠 What is the Travelling Salesman Problem?

The **Travelling Salesman Problem (TSP)** asks:

> *Given a list of cities and the distances between them, what is the shortest possible route that visits each city exactly once and returns to the origin city?*

This forms a **Hamiltonian Cycle** on the graph. TSP is **NP-Hard** — no known polynomial-time exact algorithm exists for the general case. This project implements and visualizes three approaches side by side.

---

## 🎯 Features

- 🖱 **Interactive Canvas** — click to place cities, right-click to remove
- ⚡ **Three Algorithms** — Brute Force, Nearest Neighbor Heuristic, Held-Karp DP
- 📊 **Animated Route Drawing** — amber→gold→emerald gradient path with glow & arrowheads
- ⊞ **Algorithm Comparison** — run all algorithms simultaneously and compare performance
- 📋 **Step-by-step Leg Breakdown** — distance per segment with proportional bar chart
- 🌐 **Live API Status** — real-time backend health indicator
- ✨ **Particle Background** — animated ambient network of nodes

---

## 🧮 Algorithms Implemented

| Algorithm | Type | Time Complexity | Node Limit | Description |
|---|---|---|---|---|
| **Brute Force** | Exact | O(n!) | ≤ 10 nodes | Evaluates every permutation to guarantee the optimal Hamiltonian Cycle |
| **Nearest Neighbor** | Greedy Heuristic | O(n²) | Unlimited | Always visits the closest unvisited city next |
| **Held-Karp DP** | Dynamic Programming | O(n²·2ⁿ) | ≤ 20 nodes | Bitmask DP — the best known exact TSP algorithm |

---

## 🏗 Project Structure

```
TSP AI/
├── backend/                    # Python FastAPI server
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── brute_force.py      # O(n!) exact solver
│   │   ├── nearest_neighbor.py # O(n²) greedy heuristic
│   │   └── held_karp.py        # O(n²·2ⁿ) bitmask DP
│   ├── main.py                 # FastAPI app, /api/solve + /api/compare
│   ├── models.py               # Pydantic request/response models
│   └── requirements.txt
│
├── frontend/                   # React + TypeScript + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapCanvas.tsx   # Interactive canvas (nodes + animated route)
│   │   │   ├── AlgorithmPanel.tsx  # Sidebar with algorithm selection
│   │   │   └── StatsPanel.tsx  # KPI cards, compare grid, leg breakdown
│   │   ├── App.tsx             # Root component + particle background + logo
│   │   ├── api.ts              # Axios API calls
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── index.css           # Full design system (amber + emerald theme)
│   ├── index.html
│   └── package.json
│
├── start_project.bat           # Double-click to launch everything
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://python.org)
- **Node.js 18+** — [Download](https://nodejs.org)

### Option A — One-Click Launch (Windows)

Simply **double-click `start_project.bat`**.

It will:
1. Start the FastAPI backend on `http://localhost:8000`
2. Start the Vite frontend on `http://localhost:5173`
3. Open your browser automatically after 6 seconds

> ⚠️ Minimize the two black terminal windows — **do not close them** while using the app.

---

### Option B — Manual Setup

**Step 1 — Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

**Step 2 — Frontend** (new terminal)

```bash
cd frontend
npm install
npm run dev
```

**Step 3 — Open browser**

```
http://localhost:5173
```

---

## 🔌 API Reference

Base URL: `http://localhost:8000`

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Backend health check |
| `/api/solve` | POST | Solve TSP with a chosen algorithm |
| `/api/compare` | POST | Run all algorithms and return side-by-side results |

### POST `/api/solve` Request Body

```json
{
  "nodes": [
    { "id": 1, "x": 120, "y": 200, "label": "A" },
    { "id": 2, "x": 350, "y": 180, "label": "B" }
  ],
  "algorithm": "nearest_neighbor"
}
```

Supported `algorithm` values: `brute_force` | `nearest_neighbor` | `held_karp`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Vanilla CSS (custom design system) |
| **Fonts** | Space Grotesk, JetBrains Mono |
| **HTTP** | Axios |
| **Icons** | Lucide React |

---

## 📄 License

MIT License — free to use, modify, and distribute.
