# Orin Agent supported release scope

The current Orin Agent release surface is the local/self-hosted gateway and
its hosted web client:

- `tui_gateway/` — session lifecycle, replayable events, reconnect, and
  approval requests;
- `hermes_cli/web_routers/` and `web/` — authenticated local dashboard/API;
- `hermes_cli/local_runtime/` — bounded local model/runtime discovery;
- `tools/environments/local.py` — terminal isolation and cwd handling;
- the Core-linked approval and artifact adapters exercised by the gateway
  contract tests.

The upstream repository also contains optional provider catalogs, evaluation
harnesses, and community security experiments. Those paths are not enabled as
part of the Orin Agent release and must not be treated as production-approved
without a separate threat model. In particular, do not enable optional
`security/godmode` skills or execute evaluation scripts in a user workspace.

The release gate for the supported surface is:

```bash
python -m pytest -q tests/agent/test_windows_cd_path.py
python -m pytest -q tests/gateway/test_stream_final_contract.py
python -m pytest -q tests/gateway/relay/test_auth.py
```

A full-repository static scan includes intentionally broad upstream and
optional paths; its findings are tracked as residual risk rather than silently
claimed as clean.
