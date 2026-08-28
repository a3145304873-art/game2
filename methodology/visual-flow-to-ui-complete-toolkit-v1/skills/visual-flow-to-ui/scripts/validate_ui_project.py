#!/usr/bin/env python3
"""Validate durable manifests, references, and optional interaction contract."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as error:
        raise SystemExit(f"Invalid JSON {path}: {error}") from error


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("project_root", type=Path)
    parser.add_argument(
        "--require-interaction-map",
        action="store_true",
        help="Fail when analysis/interaction-map.md is absent.",
    )
    args = parser.parse_args()
    root = args.project_root.resolve()
    problems = []

    manifests = root / "manifests"
    assets_doc = load(manifests / "assets.json")
    pages_doc = load(manifests / "pages.json")
    reuse_doc = load(manifests / "reuse-map.json")
    asset_ids = set()
    page_states = {}
    for page in pages_doc.get("pages", []):
        if page.get("id"):
            page_states[page["id"]] = set(page.get("states", []))

    for asset in assets_doc.get("assets", []):
        asset_id = asset.get("id")
        if not asset_id or asset_id in asset_ids:
            problems.append(f"Duplicate or empty asset id: {asset_id}")
        asset_ids.add(asset_id)
        file = asset.get("file")
        if file and not (root / file).is_file():
            problems.append(f"Missing asset file: {file}")
        for use_site in asset.get("usedBy", []):
            if ":" not in use_site:
                continue
            page_id, state_id = use_site.split(":", 1)
            if page_id not in page_states or state_id not in page_states[page_id]:
                problems.append(f"Unknown asset use site: {asset_id} -> {use_site}")

    page_ids = set()
    page_paths = set()
    for page in pages_doc.get("pages", []):
        page_id, path = page.get("id"), page.get("path")
        if not page_id or page_id in page_ids:
            problems.append(f"Duplicate or empty page id: {page_id}")
        if not path or path in page_paths:
            problems.append(f"Duplicate or empty page path: {path}")
        page_ids.add(page_id)
        page_paths.add(path)
        if path and not (root / path).is_file():
            problems.append(f"Missing page entry: {path}")
        states = page.get("states", [])
        if len(states) != len(set(states)):
            problems.append(f"Duplicate states in page: {page_id}")
        for references in page.get("references", {}).values():
            for reference in references:
                if not (root / reference).is_file():
                    problems.append(f"Missing source reference: {reference}")

    if not (root / "index.html").is_file():
        problems.append("Missing project index.html")
    if not isinstance(reuse_doc, dict):
        problems.append("Invalid reuse-map.json root")
    interaction_map = root / "analysis" / "interaction-map.md"
    if args.require_interaction_map and not interaction_map.is_file():
        problems.append("Missing required interaction contract: analysis/interaction-map.md")
    if problems:
        print("\n".join(f"ERROR: {item}" for item in problems))
        raise SystemExit(1)
    print(f"OK: {len(asset_ids)} assets, {len(page_ids)} pages")


if __name__ == "__main__":
    main()
