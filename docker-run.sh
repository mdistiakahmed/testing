#!/bin/bash
set -e

IMAGE_NAME="my-crawlee-app"
IMAGE_TAG="latest"

# docker run --rm -it ^

docker run --rm \
  --name crawlee-container \
  -v "$(pwd):/app" \
  -e AWS_ACCESS_KEY_ID=AKIAS2UEZEAMK3VDZ6PG \
  -e AWS_SECRET_ACCESS_KEY=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 \
  -e AWS_REGION=us-east-1 \
  ${IMAGE_NAME}:${IMAGE_TAG}
