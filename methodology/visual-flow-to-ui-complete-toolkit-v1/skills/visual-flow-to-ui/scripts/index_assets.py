#!/usr/bin/env python3
"""Index raster assets, find exact duplicates, and flag perceptually similar images."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from itertools import combinations
from pathlib import Path

from PIL import Image


RASTER = {".png", ".jpg", ".jpeg", ".webp"}


def dhash(path: Path, size: int = 12) -> str:
    image = Image.open(path).convert("L").resize((size + 1, size))
    bits = []
    pixels = image.tobytes()
    for row in range(size):
        offset = row * (size + 1)
        bits.extend(pixels[offset + col] > pixels[offset + col + 1] for col in range(size))
    return hex(sum(int(bit) << index for index, bit in enumerate(bits)))[2:]


def distance(left: str, right: str) -> int:
    return (int(left, 16) ^ int(right, 16)).bit_count()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("project_root", type=Path)
    parser.add_argument("--threshold", type=int, default=18)
    args = parser.parse_args()
    root = args.project_root.resolve()
    assets = root / "shared" / "assets"
    manifests = root / "manifests"
    analysis = root / "analysis"
    manifests.mkdir(parents=True, exist_ok=True)
    analysis.mkdir(parents=True, exist_ok=True)

    rows = []
    for path in sorted(p for p in assets.rglob("*") if p.is_file()):
        raw = path.read_bytes()
        entry = {
            "path": path.relative_to(root).as_posix(),
            "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
        }
        if path.suffix.lower() in RASTER:
            with Image.open(path) as image:
                entry.update({"width": image.width, "height": image.height, "mode": image.mode})
            entry["dhash"] = dhash(path)
        rows.append(entry)

    exact = {}
    for row in rows:
        exact.setdefault(row["sha256"], []).append(row["path"])
    exact_groups = [paths for paths in exact.values() if len(paths) > 1]

    similar = []
    rasters = [row for row in rows if "dhash" in row]
    for left, right in combinations(rasters, 2):
        score = distance(left["dhash"], right["dhash"])
        if score <= args.threshold:
            similar.append({"left": left["path"], "right": right["path"], "distance": score})
    similar.sort(key=lambda row: row["distance"])

    payload = {"version": 1, "files": rows, "exactDuplicateGroups": exact_groups}
    (manifests / "file-index.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    with (analysis / "visual-similarity.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=["left", "right", "distance"])
        writer.writeheader()
        writer.writerows(similar)
    print(f"Indexed {len(rows)} files; exact groups {len(exact_groups)}; similar pairs {len(similar)}")


if __name__ == "__main__":
    main()
