---
name: orin-tools
description: "Search the web and execute code via the free Orin Tools API."
version: 1.0.0
author: Januth Nimnal
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Research, Web, Code-Execution, Free, API]
    category: research
    related_skills: [grounded-citations]
---

# Orin Tools

Free search + sandboxed code execution with no keys: `GET /api/search`
(web results) and `POST /api/run` (20+ languages, real sandboxes).
Base URL defaults to `https://orin-search.vercel.app`, override with
`ORIN_TOOLS`. Use `read_file` for local files, `terminal` only to run the
bundled scripts below — never paste secrets into either endpoint.

## Search the web

```bash
python3 scripts/orin_search.py "weather Kandy tomorrow" --n 5
```

Returns titles, URLs, snippets, and the engines that answered. Weather
queries return a real forecast first (`open-meteo`); everything else merges
news, wiki, and general engines. Results cache 10 minutes server-side.

## Execute code

```bash
python3 scripts/orin_run.py -l python -c "print(40 + 2)"
python3 scripts/orin_run.py -l javascript -f ./probe.js --stdin "@input.txt"
```

Stdout, stderr, and exit code come back as JSON. Ten runs a minute per IP —
if you hit `429`, back off instead of retrying in a loop.

## Provenance discipline (non-negotiable)

Cite search hits with title + URL, and name the engine that produced them
(`open-meteo` for forecasts). Never present a snippet as a visited page —
if the answer needs the full page, `web_extract` the URL yourself.
