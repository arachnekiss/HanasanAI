#!/bin/bash

# HanasanAI GitHub Push Script
echo "Creating clean Git repository for HanasanAI..."

# Create temporary directory
TEMP_DIR="/tmp/hanasanai-github"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR
cd $TEMP_DIR

# Initialize clean Git repository
git init
git config user.email "hanasanai@example.com"
git config user.name "HanasanAI"

# Copy source files (excluding problematic directories)
echo "Copying source files..."
cp /home/runner/workspace/*.py .
cp /home/runner/workspace/*.toml .
cp /home/runner/workspace/*.lock .
cp /home/runner/workspace/*.md .
cp /home/runner/workspace/.gitignore .
cp -r /home/runner/workspace/templates .
cp -r /home/runner/workspace/static .
cp -r /home/runner/workspace/public .
cp -r /home/runner/workspace/ChatVRM-main .
cp -r /home/runner/workspace/ChatVRM-animate-main .

# Add all files
git add .

# Commit
git commit -m "Initial commit: HanasanAI - Advanced AI Chatbot with VRM Character

Features:
- 3D VRM character interaction with ChatVRM-style animations
- GPT-4o powered AI conversations
- Multiple interface modes (main chat, messenger, video call)
- Multilingual support with English interface
- Voice features and emotion analysis
- Open source - users provide their own OpenAI API keys"

# Set up remote
git branch -M main
git remote add origin https://${GITHUB_TOKEN}@github.com/arachnekiss/HanasanAI.git

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "✅ HanasanAI successfully pushed to GitHub!"
echo "Repository: https://github.com/arachnekiss/HanasanAI"