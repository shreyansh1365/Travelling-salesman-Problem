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
- Didn't aggres

sively kill processes first

- The cleanup wasn't happening before startup

---

## Solution: Two-Step Approach

### STEP 1: Use Cleanup Script (If You Get Port Errors)

```
Run: cleanup_ports.bat
```

This script:

- ✅ Force-kills ALL node.exe and python.exe processes
- ✅ Kills anything holding ports 8000 and 5173
- ✅ Waits 3 seconds to ensure OS releases ports

**Use this BEFORE running `start_project.bat` if you've closed windows abruptly.**

### STEP 2: Run Updated Start Script

```
Run: start_project.bat
```

The updated script:

- ✅ Kills processes automatically before starting
- ✅ Waits 2 seconds for port release to complete
- ✅ Uses `npm run dev` (more reliable than `npx`)
- ✅ Waits 30 seconds for servers to fully start

---

## Additional Help

### Diagnostic Command

If you still have issues, run this to see what's using the ports:

```
netstat -ano | findstr ":5173"
netstat -ano | findstr ":8000"
```

### Manual Restart Process

1. Open Task Manager (Ctrl+Shift+Esc)
2. Kill: node.exe and python.exe
3. Wait 15-30 seconds
4. Run start_project.bat again

### Manual Start (cmd.exe REQUIRED, not PowerShell)

Terminal 1:

```
cd d:\TSP AI\backend
py -3.13 -m uvicorn main:app --port 8000 --reload
```

Terminal 2:

```
cd d:\TSP AI\frontend
npm run dev
```

---

## Files Available

- **start_project.bat** - Main launcher
- **cleanup_ports.bat** - Just cleanup (use if port errors)
- **RUN_ME.bat** - Alternative launcher
- **DIAGNOSE.bat** - Test and show port status
- **PORT_ISSUE_HELP.md** - This guide
