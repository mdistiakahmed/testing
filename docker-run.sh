#!/bin/bash
set -e

IMAGE_NAME="my-crawlee-app"
IMAGE_TAG="latest"

docker run --rm -it \
  --name crawlee-container \
  -v "$(pwd):/app" \
  ${IMAGE_NAME}:${IMAGE_TAG}
