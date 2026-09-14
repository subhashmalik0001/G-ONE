#!/usr/bin/env bash
# ==============================================================================
# G-ONE Precision Eye & Iris Tracking Engine - Production Runner
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "======================================================================"
echo "  G-ONE Precision Eye & Iris Tracking Engine — Production Launcher"
echo "======================================================================"
echo "[G-ONE] Project Root: $PROJECT_ROOT"
echo "[G-ONE] Script Dir:   $SCRIPT_DIR"

# 1. Locate Virtual Environment
VENV_PATH=""
if [ -f "$SCRIPT_DIR/venv/bin/python3" ]; then
    VENV_PATH="$SCRIPT_DIR/venv"
elif [ -f "$PROJECT_ROOT/venv/bin/python3" ]; then
    VENV_PATH="$PROJECT_ROOT/venv"
else
    echo "[G-ONE] Error: Virtual environment not found."
    echo "[G-ONE] Creating virtual environment at $SCRIPT_DIR/venv..."
    python3 -m venv "$SCRIPT_DIR/venv"
    VENV_PATH="$SCRIPT_DIR/venv"
fi

source "$VENV_PATH/bin/activate"
PYTHON_BIN="$VENV_PATH/bin/python3"

# 2. Check Python Version
PY_VER=$("$PYTHON_BIN" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')")
echo "[G-ONE] Python:      $PY_VER"

# 3. Verify Dependencies
echo "[G-ONE] Verifying core neural dependencies..."
"$PYTHON_BIN" -c "
import sys
missing = []
for pkg in ['cv2', 'mediapipe', 'websockets', 'numpy']:
    try:
        __import__(pkg)
    except ImportError:
        missing.append(pkg)
if missing:
    print(f'[G-ONE] Missing packages: {missing}', file=sys.stderr)
    sys.exit(1)
" || {
    echo "[G-ONE] Installing missing dependencies from requirements.txt..."
    "$VENV_PATH/bin/pip" install -r "$SCRIPT_DIR/requirements.txt"
}

CV_VER=$("$PYTHON_BIN" -c "import cv2; print(cv2.__version__)")
MP_VER=$("$PYTHON_BIN" -c "import mediapipe; print(mediapipe.__version__)")
echo "[G-ONE] OpenCV:      $CV_VER"
echo "[G-ONE] MediaPipe:   $MP_VER"

# 4. Check Camera Accessibility
CAM_STATUS=$("$PYTHON_BIN" -c "
import cv2
cap = cv2.VideoCapture(0)
if cap.isOpened():
    print('READY')
    cap.release()
else:
    print('PERMISSION_OR_UNAVAILABLE')
")
echo "[G-ONE] Camera 0:    $CAM_STATUS"

if [ "$CAM_STATUS" != "READY" ]; then
    echo "[G-ONE] Warning: Camera 0 not opened. If on macOS, grant Terminal/IDE Camera permissions in System Settings -> Privacy & Security -> Camera."
fi

# 5. Check Port Availability for WebSocket Server
WS_PORT=8765
if lsof -Pi :$WS_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "[G-ONE] Note: Port $WS_PORT already occupied. Terminating previous instance..."
    kill -9 $(lsof -Pi :$WS_PORT -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 0.5
fi

echo "[G-ONE] WebSocket:   ws://localhost:$WS_PORT"
echo "[G-ONE] Tracking:    INITIALIZING..."
echo "======================================================================"
echo ""

# 6. Execute authoritative eye tracker
exec "$PYTHON_BIN" "$SCRIPT_DIR/eye_tracker.py" "$@"
