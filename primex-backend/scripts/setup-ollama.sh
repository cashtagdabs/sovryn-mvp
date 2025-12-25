#!/bin/bash
# PRIMEX SOVEREIGN - Ollama Setup Script

echo "🚀 Setting up Ollama models for PRIMEX clones..."
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Installing..."
    curl https://ollama.ai/install.sh | sh
else
    echo "✅ Ollama already installed"
fi

echo ""
echo "📦 Pulling base models (this may take a while)..."
echo ""

# Install base models
ollama pull llama3.2:3b
echo "✅ llama3.2:3b downloaded"

ollama pull mistral:7b
echo "✅ mistral:7b downloaded"

# Optional: larger models (comment out if 8GB RAM)
# ollama pull codellama:13b
# ollama pull dolphin-mixtral:8x7b

echo ""
echo "🔧 Creating custom clone models..."
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MODELFILES_DIR="$SCRIPT_DIR/../ollama/clone-prompts"

cd "$MODELFILES_DIR" || exit 1

# Create custom models
echo "Creating ARCHITECT..."
ollama create architect -f architect.Modelfile

echo "Creating CORTEX..."
ollama create cortex -f cortex.Modelfile

echo "Creating CENTURION..."
ollama create centurion -f centurion.Modelfile

# For larger models (if you have 16GB+ RAM)
# echo "Creating GHOSTLINE..."
# ollama create ghostline -f ghostline.Modelfile
# echo "Creating GOODJEW..."
# ollama create goodjew -f goodjew.Modelfile

echo ""
echo "✅ Ollama setup complete!"
echo ""
echo "Test with:"
echo "  ollama run architect 'Design a secure API authentication system'"
echo "  ollama run cortex 'Analyze the risk/reward of launching MVP now vs waiting 2 months'"
echo ""
