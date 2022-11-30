docker buildx build \
  -f dev.Dockerfile \
  --platform linux/arm64 \
  --platform linux/amd64 \
  --tag $IMAGE \
  --push \
  $BUILD_CONTEXT