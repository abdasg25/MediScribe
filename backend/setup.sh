#!/bin/bash

# MediScribe Backend - Quick Setup Script
# This script sets up the backend environment automatically

echo "🚀 Setting up MediScribe Backend..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# Install dependencies
echo "📥 Installing Python dependencies (this may take a few minutes)..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Check .env file
if grep -q "postgresql://user:password@host:port/database" .env; then
    echo "⚠️  WARNING: DATABASE_URL in .env needs to be updated!"
    echo "   Please set up Railway database and update DATABASE_URL"
    echo ""
    echo "   Steps:"
    echo "   1. Go to https://railway.app"
    echo "   2. Create new project → Provision PostgreSQL"
    echo "   3. Copy DATABASE_URL from Variables tab"
    echo "   4. Update .env file with the DATABASE_URL"
    echo ""
else
    echo "✅ DATABASE_URL appears to be configured"
    echo ""
fi

# Check Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is installed"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama server is running"
        
        # Check if qwen model is installed
        if ollama list | grep -q "qwen2.5"; then
            echo "✅ Qwen model is installed"
        else
            echo "⚠️  Qwen model not found. Installing..."
            echo "   This will download ~20GB. Please wait..."
            ollama pull qwen2.5:32b
        fi
    else
        echo "⚠️  Ollama server is not running"
        echo "   Run 'ollama serve' in a separate terminal"
    fi
else
    echo "⚠️  Ollama is not installed"
    echo ""
    echo "   Install Ollama:"
    echo "   curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    echo "   Then pull Qwen model:"
    echo "   ollama pull qwen2.5:32b"
    echo ""
fi

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure DATABASE_URL in .env is configured"
echo "2. Start Ollama server (in terminal 1):"
echo "   ollama serve"
echo ""
echo "3. Start FastAPI server (in terminal 2):"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "4. Open http://localhost:8000/docs to test API"
echo ""
