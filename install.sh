#!/usr/bin/env bash
# ==============================================================================
# 🎨 Favi Installer — Zero-Friction One-Line Setup
# ==============================================================================
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/shlok377/favicon/master/install.sh | bash
#
# Future hosting compatible:
#   curl -fsSL https://www.use-favi.web.app/install.sh | bash
# ==============================================================================
set -euo pipefail

# ANSI Color Codes
BOLD="\033[1m"
GREEN="\033[1;32m"
BLUE="\033[1;34m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
CYAN="\033[1;36m"
RESET="\033[0m"

REPO_URL="https://github.com/shlok377/favicon"
ARCHIVE_URL="https://github.com/shlok377/favicon/archive/refs/heads/master.tar.gz"

echo -e "${BLUE}====================================================================${RESET}"
echo -e "${BOLD}${CYAN}   🎨 Welcome to Favi — Favicon & Social Asset Generator${RESET}"
echo -e "${BLUE}====================================================================${RESET}"
echo ""

# ------------------------------------------------------------------------------
# 1. OS Auto-Detection & Interactive Confirmation
# ------------------------------------------------------------------------------
DETECTED_OS="Linux"
OS_UNAME="$(uname -s 2>/dev/null || echo "Unknown")"

case "$OS_UNAME" in
    Linux*)
        DETECTED_OS="Linux"
        DEFAULT_CHOICE="1"
        ;;
    Darwin*)
        DETECTED_OS="macOS"
        DEFAULT_CHOICE="2"
        ;;
    CYGWIN*|MINGW*|MSYS*)
        DETECTED_OS="Windows (Bash/MSYS)"
        DEFAULT_CHOICE="3"
        ;;
    *)
        DETECTED_OS="Linux"
        DEFAULT_CHOICE="1"
        ;;
esac

echo -e "${BOLD}🔍 Detected Operating System:${RESET} ${GREEN}$DETECTED_OS${RESET}"

TARGET_OS="$DEFAULT_CHOICE"

# Attempt interactive prompt if /dev/tty is available
if [ -e /dev/tty ] && [ -r /dev/tty ]; then
    echo -e "   [1] Linux   [2] macOS   [3] Windows"
    echo -ne "${BOLD}Target OS [Press Enter for default: ${GREEN}$DEFAULT_CHOICE${RESET}${BOLD}]: ${RESET}"
    if read -r -t 6 USER_CHOICE </dev/tty; then
        if [ -n "$USER_CHOICE" ]; then
            TARGET_OS="$USER_CHOICE"
        fi
    else
        echo ""
        echo -e "${CYAN}Proceeding automatically with detected OS (${DETECTED_OS})...${RESET}"
    fi
else
    echo -e "${CYAN}Non-interactive terminal detected. Proceeding with detected OS (${DETECTED_OS})...${RESET}"
fi

case "$TARGET_OS" in
    1|linux|Linux)
        SELECTED_OS="Linux"
        ;;
    2|macos|macOS|darwin|Darwin)
        SELECTED_OS="macOS"
        ;;
    3|windows|Windows)
        SELECTED_OS="Windows"
        ;;
    *)
        SELECTED_OS="$DETECTED_OS"
        ;;
esac

echo -e "✔ Selected platform: ${GREEN}$SELECTED_OS${RESET}"
echo ""

# ------------------------------------------------------------------------------
# 2. Installation Directory Selection
# ------------------------------------------------------------------------------
DEFAULT_INSTALL_DIR="$HOME/Desktop/Favi"
if [ ! -d "$HOME/Desktop" ] && [ "$SELECTED_OS" = "Linux" ]; then
    DEFAULT_INSTALL_DIR="$HOME/Favi"
fi

INSTALL_DIR="${FAVI_DIR:-$DEFAULT_INSTALL_DIR}"
echo -e "📂 Target installation directory: ${CYAN}$INSTALL_DIR${RESET}"

# Signal cleanup handler for graceful rollback on error or abort
cleanup_on_error() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo -e "${RED}[Favi Installer] ✖ Installation interrupted or failed (Exit code: $exit_code).${RESET}"
        if [ -d "$INSTALL_DIR/logs" ] && [ -f "$INSTALL_DIR/logs/install.log" ]; then
            echo -e "${YELLOW}Review detailed installation logs at: $INSTALL_DIR/logs/install.log${RESET}"
        fi
    fi
}
trap cleanup_on_error EXIT INT TERM

mkdir -p "$INSTALL_DIR/logs"
INSTALL_LOG="$INSTALL_DIR/logs/install.log"
echo "=== Favi Install Log $(date) ===" > "$INSTALL_LOG"

# ------------------------------------------------------------------------------
# 3. Stream & Extract Codebase (No Git Required)
# ------------------------------------------------------------------------------
echo -e "${BOLD}[1/4] 📥 Downloading Favi package...${RESET}"

DOWNLOAD_SUCCESS=false

# Method A: Direct Tarball Extraction
if command -v curl &>/dev/null && command -v tar &>/dev/null; then
    echo "  → Streaming and extracting release archive from GitHub..." >> "$INSTALL_LOG"
    if curl -fsSL --retry 2 "$ARCHIVE_URL" | tar -xz -C "$INSTALL_DIR" --strip-components=1 >> "$INSTALL_LOG" 2>&1; then
        DOWNLOAD_SUCCESS=true
        echo -e "  ${GREEN}✔ Package downloaded and extracted successfully.${RESET}"
    fi
fi

# Method B: Git Clone Fallback
if [ "$DOWNLOAD_SUCCESS" = false ]; then
    if command -v git &>/dev/null; then
        echo "  → Tarball download failed; attempting git clone..." >> "$INSTALL_LOG"
        rm -rf "$INSTALL_DIR"
        mkdir -p "$INSTALL_DIR/logs"
        if git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" >> "$INSTALL_LOG" 2>&1; then
            DOWNLOAD_SUCCESS=true
            echo -e "  ${GREEN}✔ Codebase cloned successfully via Git.${RESET}"
        fi
    fi
fi

if [ "$DOWNLOAD_SUCCESS" = false ]; then
    echo -e "${RED}✖ Failed to download Favi archive. Please verify your internet connection or install git.${RESET}"
    exit 1
fi

# Ensure launchers are executable
chmod +x "$INSTALL_DIR/favi" 2>/dev/null || true
chmod +x "$INSTALL_DIR/uninstall.sh" 2>/dev/null || true

# ------------------------------------------------------------------------------
# 4. Provision Python Runtime (Zero-Sudo with uv)
# ------------------------------------------------------------------------------
echo -e "${BOLD}[2/4] ⚡ Provisioning runtime & dependencies...${RESET}"
echo "  → Setting up virtual environment..." >> "$INSTALL_LOG"

(
    cd "$INSTALL_DIR"
    ./favi setup-runtime >> "$INSTALL_LOG" 2>&1 || true
)

# ------------------------------------------------------------------------------
# 5. Create Desktop Shortcuts
# ------------------------------------------------------------------------------
echo -e "${BOLD}[3/4] 🖥 Creating desktop shortcut & application menu entry...${RESET}"
(
    cd "$INSTALL_DIR"
    ./favi setup-shortcuts >> "$INSTALL_LOG" 2>&1
)
echo -e "  ${GREEN}✔ Desktop shortcuts registered.${RESET}"

# ------------------------------------------------------------------------------
# 6. Launch Application
# ------------------------------------------------------------------------------
echo -e "${BOLD}[4/4] 🚀 Starting Favi on http://localhost:1937...${RESET}"
(
    cd "$INSTALL_DIR"
    ./favi start >> "$INSTALL_LOG" 2>&1
)

echo ""
echo -e "${GREEN}====================================================================${RESET}"
echo -e "${BOLD}${GREEN}   ✨ Favi is installed and ready to cook!${RESET}"
echo -e "${GREEN}====================================================================${RESET}"
echo -e "   • App URL:          ${CYAN}http://localhost:1937${RESET}"
echo -e "   • Desktop Folder:   ${CYAN}$INSTALL_DIR${RESET}"
echo -e "   • Desktop Shortcut: ${CYAN}$HOME/Desktop/Favi.desktop${RESET}"
echo ""
echo -e "${BOLD}Management commands (from $INSTALL_DIR):${RESET}"
echo -e "   ${CYAN}./favi status${RESET}    Check server status"
echo -e "   ${CYAN}./favi stop${RESET}      Stop the background server"
echo -e "   ${CYAN}./favi start${RESET}     Start server and open app window"
echo -e "   ${CYAN}./favi logs${RESET}      View server output"
echo -e "   ${CYAN}./uninstall.sh${RESET}  Clean uninstallation"
echo ""

# Remove trap on successful completion
trap - EXIT INT TERM
exit 0
