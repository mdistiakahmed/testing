#!/bin/bash
set -e

IMAGE_NAME="my-crawlee-app"
IMAGE_TAG="latest"

docker run --rm -it \
  --name crawlee-container \
  -v "$(pwd):/app" \
  --memory=1g \
  --memory-swap=1g \
  ${IMAGE_NAME}:${IMAGE_TAG}
