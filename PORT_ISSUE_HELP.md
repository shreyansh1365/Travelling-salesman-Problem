# Port Issue - Root Cause & Solutions

## Why This Keeps Happening

### Problem 1: Process Orphaning

- When you close a terminal window ungracefully, processes may not terminate fully
- The Node.js and Python processes keep running in the background, holding the ports
- When you try to start again, the ports are already in use

### Problem 2: OS TCP Connection Timeout

- Even after killing processes, Windows keeps the TCP connection in `TIME_WAIT` state
- This reserves the port for 30-60 seconds before fully releasing it
- Starting immediately after closing causes: "Address already in use"

### Problem 3: The BAT Script Was Insufficient

- It only attempted to kill by port as a secondary measure
- Didn't aggressively kill processes first
- The cleanup wasn't happening before startup

---

## Solution: Two-Step Approach

### STEP 1: Use Cleanup Script (If You Get Port Errors)
