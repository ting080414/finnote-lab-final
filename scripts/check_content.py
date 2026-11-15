#!/usr/bin/env python3
"""Validate FinNote Lab metadata and Markdown without third-party packages."""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
CATALOG = DOCS / "content" / "catalog.json"
CATEGORIES = {"因果推論", "財務指標", "公司理財"}
REQUIRED = {"slug", "title", "category", "summary", "tags", "updated", "minutes", "file"}


def main() -> int:
    problems = []
    try:
        articles = json.loads(CATALOG.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as err:
        print(f"FAIL catalog.json: {err}")
        return 1

    if not isinstance(articles, list) or not articles:
        problems.append("catalog.json must be a nonempty array")
        articles = []

    slugs = set()
    files = set()
    for i, note in enumerate(articles, start=1):
        name = f"article #{i}"
        if not isinstance(note, dict):
            problems.append(f"{name}: must be an object")
            continue
        missing = REQUIRED - note.keys()
        if missing:
            problems.append(f"{name}: missing {sorted(missing)}")
            continue
        slug = note["slug"]
        if not isinstance(slug, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            problems.append(f"{name}: invalid slug: {slug!r}")
            continue
        if slug in slugs:
            problems.append(f"{name}: duplicate slug {slug}")
        slugs.add(slug)
        if not isinstance(note["title"], str) or not note["title"].strip():
            problems.append(f"{slug}: empty title")
        if not isinstance(note["summary"], str) or not note["summary"].strip():
            problems.append(f"{slug}: empty summary")
        if note["category"] not in CATEGORIES:
            problems.append(f"{slug}: category must be one of {sorted(CATEGORIES)}")
        if not isinstance(note["tags"], list) or not 2 <= len(note["tags"]) <= 4 or not all(isinstance(tag,str) and tag.strip() for tag in note["tags"]):
            problems.append(f"{slug}: tags must be 2–4 nonempty strings")
        if isinstance(note["minutes"], bool) or not isinstance(note["minutes"], int) or note["minutes"] <= 0:
            problems.append(f"{slug}: minutes must be a positive integer")
        try:
            date.fromisoformat(note["updated"])
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", note["updated"]):
                raise ValueError("date format")
        except (ValueError, TypeError):
            problems.append(f"{slug}: updated must be YYYY-MM-DD")
        expected = f"content/articles/{slug}.md"
        if note["file"] != expected:
            problems.append(f"{slug}: file must be {expected}")
            continue
        files.add(expected)
        file_path = DOCS / expected
        if not file_path.is_file():
            problems.append(f"{slug}: missing {expected}")
            continue
        content = file_path.read_text(encoding="utf-8")
        if len(re.findall(r"^##\s+\S", content, re.M)) < 3:
            problems.append(f"{slug}: must contain at least 3 second-level headings")
        if not content.strip():
            problems.append(f"{slug}: article is empty")

    unindexed = {f"content/articles/{p.name}" for p in (DOCS / "content" / "articles").glob("*.md")} - files
    for p in sorted(unindexed):
        problems.append(f"unindexed article: {p}")

    if not (DOCS / "index.html").is_file():
        problems.append("docs/index.html is missing")
    if not (ROOT / "AGENTS.md").is_file():
        problems.append("AGENTS.md is missing")

    if problems:
        for problem in problems:
            print("FAIL:", problem)
        print(f"\n{len(problems)} problem(s) found")
        return 1
    print(f"PASS: {len(articles)} article(s), unique slugs, valid catalog, existing Markdown files, required headings.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
