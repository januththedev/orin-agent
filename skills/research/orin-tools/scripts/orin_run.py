#!/usr/bin/env python3
"""Execute code via Orin Tools sandboxes. Prints JSON. No dependencies."""
import argparse
import json
import os
import sys
import urllib.request

BASE = os.environ.get("ORIN_TOOLS", "https://orin-search.vercel.app").rstrip("/")


def read_maybe(path: str) -> str:
    if path.startswith("@"):
        with open(path[1:], encoding="utf-8") as f:
            return f.read()
    return path


def main() -> int:
    ap = argparse.ArgumentParser(description="Free code execution (Orin Tools).")
    ap.add_argument("-l", "--language", required=True, help="python, javascript, go, …")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("-c", "--code", help="Code string (prefix @ to read a file)")
    src.add_argument("-f", "--file", help="Code file to run")
    ap.add_argument("-i", "--stdin", default="", help="Stdin (prefix @ for file)")
    args = ap.parse_args()

    code = read_maybe(args.code) if args.code else open(args.file, encoding="utf-8").read()
    body = json.dumps({
        "language": args.language,
        "code": code,
        "stdin": read_maybe(args.stdin) if args.stdin else "",
    }).encode()
    req = urllib.request.Request(
        BASE + "/api/run", data=body,
        headers={"Content-Type": "application/json", "User-Agent": "OrinAgent/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            print(json.dumps(json.load(r), indent=2))
    except Exception as e:  # noqa: BLE001 - CLI surface, message is the output
        print(json.dumps({"error": str(e)}))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
