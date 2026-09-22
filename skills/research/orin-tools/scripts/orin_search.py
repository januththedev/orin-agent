#!/usr/bin/env python3
"""Search the web via Orin Tools. Prints JSON results. No dependencies."""
import argparse
import json
import os
import sys
import urllib.parse
import urllib.request

BASE = os.environ.get("ORIN_TOOLS", "https://orin-search.vercel.app").rstrip("/")


def main() -> int:
    ap = argparse.ArgumentParser(description="Free web search (Orin Tools).")
    ap.add_argument("query", help="Search query")
    ap.add_argument("--n", type=int, default=5, help="Results, 1-10")
    args = ap.parse_args()
    n = min(max(args.n, 1), 10)
    url = BASE + "/api/search?" + urllib.parse.urlencode({"q": args.query, "n": n})
    req = urllib.request.Request(url, headers={"User-Agent": "OrinAgent/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(json.dumps(json.load(r), indent=2))
    except Exception as e:  # noqa: BLE001 - CLI surface, message is the output
        print(json.dumps({"error": str(e)}))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
