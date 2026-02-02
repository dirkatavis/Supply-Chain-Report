#!/usr/bin/env python3
"""
Dashboard Launcher Script
Launches the Supply Chain Report dashboard locally.
"""

import sys
import subprocess
import webbrowser
import time
import os

def start_server(port=8000):
    """Start the local HTTP server."""
    print(f"Starting local server on http://localhost:{port}")
    print("Press Ctrl+C to stop the server")

    try:
        # Use python -m http.server for the current directory
        subprocess.run([sys.executable, '-m', 'http.server', str(port)], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start server: {e}")
        return False
    return True

def main():
    """Main launcher function."""
    print("Supply Chain Report Dashboard Launcher")
    print("=" * 40)

    # Check if we're in the right directory
    if not os.path.exists('index.html') or not os.path.exists('config.yaml'):
        print("Error: Please run this script from the Supply-Chain-Report directory")
        print("Required files: index.html, config.yaml")
        sys.exit(1)

    # Open browser after a short delay
    port = 8000
    url = f"http://localhost:{port}"
    print(f"Opening {url} in your default browser...")
    time.sleep(1)  # Give server time to start
    webbrowser.open(url)

    # Start the server (this will block until stopped)
    start_server(port)

if __name__ == "__main__":
    main()