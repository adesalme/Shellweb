#!/bin/bash

# Lumo - PowerShell Web Editor Startup Script
# This script sets up and starts the Lumo application

set -e

echo "🚀 Starting Lumo - PowerShell Web Editor"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running in production"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p database/data
mkdir -p backend/logs
mkdir -p frontend/build

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose pull

# Build the application
echo "🔨 Building application..."
docker-compose build

# Start the services
echo "🏁 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U lumo &> /dev/null; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Backend
if curl -s http://localhost:4000/api/health &> /dev/null; then
    echo "✅ Backend API is ready"
else
    echo "❌ Backend API is not ready"
fi

# Check PowerShell Executor
if curl -s http://localhost:5001/health &> /dev/null; then
    echo "✅ PowerShell Executor is ready"
else
    echo "❌ PowerShell Executor is not ready"
fi

# Check Frontend
if curl -s http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend is not ready"
fi

echo ""
echo "🎉 Lumo is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"
echo "💾 Database: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo ""
echo "📚 Documentation: https://github.com/your-org/lumo"
echo "🆘 Support: https://github.com/your-org/lumo/issues"