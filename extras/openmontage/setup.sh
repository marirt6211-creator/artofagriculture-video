#!/usr/bin/env bash
# Install OpenMontage into ~/openmontage (outside this repo, so it never mixes
# with the NFP-Alvana kit). Idempotent; run on demand: bash extras/openmontage/setup.sh
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
OM="$HOME/openmontage"
if [ -f "$OM/.om-ready" ]; then echo "OpenMontage: ready ($OM)"; exit 0; fi
[ -d "$OM/.git" ] || git clone --depth 1 https://github.com/calesthio/OpenMontage.git "$OM"
cd "$OM"
make setup > "$HOME/om-setup.log" 2>&1 || { tail -20 "$HOME/om-setup.log"; exit 1; }
# Reuse the NFP kit's Chrome Headless Shell (remotion.media is not reachable here), CPU GL.
cp "$HERE/remotion.config.ts" remotion-composer/remotion.config.ts
# ElevenLabs: the cloud proxy injects the real key; keep a placeholder so tools register.
sed -i 's/^ELEVENLABS_API_KEY=$/ELEVENLABS_API_KEY=injected-by-cloud-proxy/' .env
cp "$HERE/sitecustomize.py" "$(.venv/bin/python -c 'import site;print(site.getsitepackages()[0])')/sitecustomize.py"
touch .om-ready
echo "OpenMontage: installed ($OM)"
