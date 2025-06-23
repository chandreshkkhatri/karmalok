#!/bin/bash

# AI Chat Interface Setup Script

echo "🚀 Setting up AI Chat Interface..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📋 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local file"
    echo "⚠️  Please edit .env.local and add your OpenAI API key"
else
    echo "✅ .env.local already exists"
fi

# Check if MongoDB is running (if using local MongoDB)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Starting MongoDB..."
        if command -v brew &> /dev/null; then
            brew services start mongodb/brew/mongodb-community
            echo "✅ Started MongoDB using Homebrew"
        else
            echo "❌ Please start MongoDB manually"
        fi
    fi
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use MongoDB Atlas"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your OpenAI API key"
echo "2. Ensure MongoDB is running"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md"
