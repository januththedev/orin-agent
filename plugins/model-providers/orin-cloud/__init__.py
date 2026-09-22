"""Orin Cloud provider profile — free Orin presets, no per-model keys.

Auth is an Orin session token (``orin login`` on web, or the ``orin`` CLI),
sent as a Bearer token to the OpenAI-compatible gateway. Models are the
Orin presets (thinking / balanced / coding / cheap), resolved live
server-side — the catalog here is intentionally fixed.
"""

from providers import register_provider
from providers.base import ProviderProfile

ORIN_MODELS = (
    "orin-thinking",
    "orin-balanced",
    "orin-coding",
    "orin-cheap",
)


class OrinCloudProfile(ProviderProfile):
    """Orin Cloud — Orin presets over an OpenAI-compatible gateway."""

    def fetch_models(self, *, api_key=None, base_url=None, timeout=8.0):  # noqa: ANN001, ANN002
        # Fixed preset catalog; live resolution happens server-side.
        return list(ORIN_MODELS)


orin_cloud = OrinCloudProfile(
    name="orin-cloud",
    aliases=("orin",),
    display_name="Orin Cloud",
    description="Free Orin presets (thinking/balanced/coding), no model keys",
    signup_url="https://orinai.org",
    env_vars=("ORIN_TOKEN", "ORIN_API"),
    base_url="https://orinai.org/api/openai/v1",
    models_url="https://orinai.org/api/openai/v1/models",
    default_aux_model="orin-cheap",
)

register_provider(orin_cloud)
