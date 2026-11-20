"""Single-command cross-platform runner for SentinelOps."""
import os
import subprocess
import sys
import time
import webbrowser

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    python_bin = os.path.join(root, ".venv", "Scripts", "python.exe")
    if not os.path.exists(python_bin):
        python_bin = sys.executable

    print("=" * 60)
    print("🛡️  Starting SentinelOps Observability Platform")
    print("=" * 60)

    # 1. Start Backend
    print("[1/3] Starting SaaS Backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [python_bin, "-m", "uvicorn", "saas.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=root,
    )
    time.sleep(2)

    # 2. Start Collector
    print("[2/3] Starting Local Collector on http://localhost:8000/api/v1/ingest ...")
    collector_proc = subprocess.Popen(
        [python_bin, "-m", "collector.cli", "start", "--simulation-mode", "normal"],
        cwd=root,
    )
    time.sleep(1)

    # 3. Start Frontend
    print("[3/3] Starting Next.js Web on http://localhost:3000 ...")
    frontend_dir = os.path.join(root, "frontend")
    frontend_proc = subprocess.Popen(
        ["npm.cmd" if os.name == "nt" else "npm", "run", "dev", "--", "-p", "3000"],
        cwd=frontend_dir,
    )
    time.sleep(3)

    print("\n✅ All SentinelOps services running:")
    print("   👉 Web App:      http://localhost:3000")
    print("   👉 SaaS API:     http://localhost:8000")
    print("   👉 Swagger Docs: http://localhost:8000/docs")
    print("   👉 Login:        admin@sentinelops.io / SentinelAdmin2026!")
    print("\nOpening browser in 2 seconds (Press Ctrl+C to stop all)...")
    time.sleep(2)
    webbrowser.open("http://localhost:3000")

    try:
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping all services...")
        backend_proc.terminate()
        collector_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
