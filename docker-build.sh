#!/bin/bash
set -e  # Exit on error

IMAGE_NAME="my-crawlee-app"
IMAGE_TAG="latest"

echo "Building Docker image: $IMAGE_NAME:$IMAGE_TAG..."
sudo docker build \
  -t "$IMAGE_NAME:$IMAGE_TAG" \
  .

echo "Docker image $IMAGE_NAME:$IMAGE_TAG built successfully."

#chmod +x docker-build.sh

#sudo chmod -R 777 storage
