#!/bin/sh
set -e
mkdir -p results_tesseract
count=0
for f in images/*.png; do
    base=$(basename "$f" .png)
    echo "Processing $base..."
    tesseract "$f" "results_tesseract/$base" --psm 3 > /dev/null 2>&1
    count=$((count + 1))
done
echo "Completed $count images."
