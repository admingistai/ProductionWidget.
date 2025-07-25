#!/bin/bash
echo "🚀 Starting local test server..."
echo "📁 Serving from: $(pwd)"
echo ""
echo "🌐 Test URLs:"
echo "  - Local widget test: http://localhost:8000/test-local-widget.html"
echo "  - Fixed widget test: http://localhost:8000/test-fixed-widget.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
python3 -m http.server 8000