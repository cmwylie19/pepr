#!/bin/bash

# Copyright 2024 Defense Unicorns
# SPDX-License-Identifier: Apache-2.0

set -e  # Exit on error
set -o pipefail  # Fail if any command in a pipeline fails

# Ensure PEPR environment variable is set
if [[ -z "$PEPR" ]]; then
  echo "Error: PEPR environment variable is not set."
  exit 1
fi

cd "$PEPR"

# Define output image tar paths
PEPR_AMD_TAR="$(pwd)/pepr-amd-img.tar"
PEPR_ARM_TAR="$(pwd)/pepr-arm-img.tar"

echo "PEPR_AMD_TAR=${PEPR_AMD_TAR}"
echo "PEPR_ARM_TAR=${PEPR_ARM_TAR}"

# Build Pepr
npm run build

# Copy original package
cp pepr-0.0.0-development.tgz pepr-0.0.0-development.tar.gz

# Decompress, rename, and clean up
tar -zxvf pepr-0.0.0-development.tar.gz
mv package pepr
rm pepr-0.0.0-development.tar.gz

# Prepare package-lock.json and build-template-data.json
cd pepr
mkdir -p hack
cp "$PEPR/hack/build-template-data.js" hack/
cp "$PEPR/build.mjs" .
cp "$PEPR/tsconfig.json" .
npm i
cd ..

# Repackage
tar -zcvf pepr-0.0.0-development.tar.gz pepr
mv pepr-0.0.0-development.tgz "$(pwd)/pepr-0.0.0-development.tgz"

# Build Docker images
docker build --build-arg PEPR_BUILD_VERSION=0.0.0 -t pepr:amd -f Dockerfile.ironbank.amd .
docker build --build-arg PEPR_BUILD_VERSION=0.0.0 -t pepr:arm -f Dockerfile.ironbank.arm .

# Save Docker images
docker image save --output "$PEPR_AMD_TAR" pepr:amd
docker image save --output "$PEPR_ARM_TAR" pepr:arm

echo "Build complete! Images saved to:"
echo "  - $PEPR_AMD_TAR"
echo "  - $PEPR_ARM_TAR"
