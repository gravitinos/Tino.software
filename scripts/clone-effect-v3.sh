#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${ROOT}/reference/effect-v3"
TAG="${EFFECT_V3_TAG:-effect@3.21.2}"

if [[ -d "${TARGET}/.git" ]]; then
  echo "Effect v3 reference already exists at ${TARGET}"
  exit 0
fi

mkdir -p "${ROOT}/reference"
git clone --depth 1 --branch "${TAG}" https://github.com/Effect-TS/effect.git "${TARGET}"
echo "Cloned Effect ${TAG} to ${TARGET}"
