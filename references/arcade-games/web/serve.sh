#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"
HOST="${2:-127.0.0.1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

echo "🐍 Servindo Snake em http://${HOST}:${PORT}/"
echo "📂 Diretório: $SCRIPT_DIR"
echo "🛑 Pressione Ctrl+C para parar"
echo ""

# Tenta diferentes servidores disponíveis
if command -v python3 &>/dev/null; then
    python3 -m http.server "$PORT" --bind "$HOST"
elif command -v python &>/dev/null; then
    python -m SimpleHTTPServer "$PORT" --bind "$HOST" 2>/dev/null || python -m SimpleHTTPServer "$PORT"
elif command -v node &>/dev/null; then
    node -e "
        const http = require('http');
        const fs = require('fs');
        const path = require('path');
        const mime = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        http.createServer((req, res) => {
            let file = path.join('.', req.url === '/' ? 'index.html' : req.url);
            const ext = path.extname(file).toLowerCase();
            fs.readFile(file, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
                    res.end(data);
                }
            });
        }).listen($PORT, '$HOST', () => console.log('Node HTTP server running'));
    "
elif command -v php &>/dev/null; then
    php -S "${HOST}:${PORT}"
elif command -v busybox &>/dev/null; then
    busybox httpd -f -p "${HOST}:${PORT}" -h "$SCRIPT_DIR"
else
    echo "❌ Nenhum servidor encontrado. Instale python3, node, php ou busybox."
    exit 1
fi
