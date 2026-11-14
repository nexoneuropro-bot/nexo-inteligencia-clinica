#!/usr/bin/env python3
"""Create NEXO's original, silent 3.5-second brand opening with FFmpeg.

The authorized PNG is preserved as the source identity. Animated alpha, soft
shadow, a restrained copper light and a highlight sweep provide depth; this is
an original motion composition, not live footage or a rendered 3D scene.

Usage: python scripts/generate-opening-video.py --ffmpeg /path/to/ffmpeg
Add --proof to save a four-frame contact sheet and a metadata report.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
TASK_ROOT = ROOT.parents[1]
SOURCE = ROOT / 'public/brand/logo-nexo-horizontal-sobre-dark.png'
OUTPUT = ROOT / 'public/media/nexo-abertura.mp4'
PROOFS = TASK_ROOT / 'outputs/capturas-abertura'
DURATION = 3.5
WIDTH, HEIGHT, FPS = 960, 540, 24


def ffmpeg_path(explicit):
    if explicit:
        return explicit
    if os.environ.get('FFMPEG_BINARY'):
        return os.environ['FFMPEG_BINARY']
    if shutil.which('ffmpeg'):
        return shutil.which('ffmpeg')
    sys.path.insert(0, str(TASK_ROOT / 'work/video-tools'))
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except (ImportError, AttributeError):
        candidate = TASK_ROOT / 'work/video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
        if candidate.is_file():
            return str(candidate)
    raise SystemExit('FFmpeg not found. Pass --ffmpeg or set FFMPEG_BINARY.')


def run(command):
    result = subprocess.run(command, capture_output=True, text=True,
                            encoding='utf-8', errors='replace', timeout=240)
    if result.returncode:
        raise SystemExit(result.stderr[-12000:])
    return result


def graph():
    # Crop only fully transparent source padding. The visible mark is unchanged.
    # Source alpha bounds: (127,72)-(1129,316) in the authorized 1600x444 PNG.
    centre = 'exp(-pow((X-480)/590,2)-pow((Y-270)/370,2))'
    light = 'exp(-pow((X-(160+210*T))/250,2)-pow((Y-270)/190,2))*exp(-pow((T-1.2)/.85,2))'
    reveal = '(.055+.945*clip(1.35*(T-.2)-X/W+.08,0,1))'
    highlight = 'exp(-pow((X-W*(T-.35)/1.55)/(W*.105),2))*.42'
    alpha_reveal = f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='alpha(X,Y)*{reveal}'"
    return ';'.join([
        f"nullsrc=s={WIDTH}x{HEIGHT}:r={FPS}:d={DURATION},format=gbrp,geq=r='4+3*{centre}+8*{light}':g='24+6*{centre}+3*{light}':b='34+11*{centre}+1*{light}'[bg]",
        '[0:v]crop=1002:244:127:72,scale=690:168:flags=lanczos,format=rgba,split=4[main][glow][shadow][shine]',
        f'[main]{alpha_reveal}[formed]',
        f'[glow]{alpha_reveal},colorchannelmixer=aa=.28,gblur=sigma=11,fade=t=out:st=1.65:d=0.8:alpha=1[glowv]',
        '[shadow]colorchannelmixer=rr=0:gg=0:bb=0:aa=.5,gblur=sigma=7,fade=t=in:st=0.15:d=0.9:alpha=1[shadowv]',
        f"[shine]lutrgb=r='min(val*1.18,255)':g='min(val*1.18,255)':b='min(val*1.18,255)',geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='alpha(X,Y)*{highlight}'[shinev]",
        "[bg][shadowv]overlay=x='(W-w)/2+8*(1-min(t/2.2,1))':y='(H-h)/2+10':eval=frame[depth]",
        '[depth][glowv]overlay=x=(W-w)/2:y=(H-h)/2[lit]',
        "[lit][formed]overlay=x='(W-w)/2':y='(H-h)/2+8*(1-min(t/2,1))':eval=frame[brand]",
        "[brand][shinev]overlay=x='(W-w)/2':y='(H-h)/2+8*(1-min(t/2,1))':eval=frame,format=yuv420p[out]",
    ])


def inspect(exe):
    result = run([exe, '-hide_banner', '-i', str(OUTPUT), '-f', 'null', '-'])
    log = result.stderr
    if 'Video: h264' not in log or 'yuv420p' not in log:
        raise SystemExit('Opening video must be H.264 / yuv420p.')
    if re.search(r'Stream[^\n]*Audio:', log):
        raise SystemExit('Opening video unexpectedly contains audio.')
    if 'Duration: 00:00:03.50' not in log:
        raise SystemExit('Unexpected opening duration.')
    size = OUTPUT.stat().st_size
    if size > 500_000:
        raise SystemExit(f'Opening exceeds 500 kB: {size} bytes.')
    return {
        'file': 'public/media/nexo-abertura.mp4',
        'durationSeconds': DURATION, 'width': WIDTH, 'height': HEIGHT,
        'framesPerSecond': FPS, 'codec': 'h264', 'pixelFormat': 'yuv420p',
        'hasAudio': False, 'bytes': size,
        'sha256': hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
        'source': 'public/brand/logo-nexo-horizontal-sobre-dark.png',
        'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'backgroundCentre': '#071e2d', 'backgroundEdge': '#041822',
        'method': 'Original FFmpeg motion composition using the authorized brand PNG; alpha reveal, soft depth shadow and restrained light sweep.',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg')
    parser.add_argument('--proof', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    exe = ffmpeg_path(args.ffmpeg)
    if not args.check:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        run([exe, '-y', '-hide_banner', '-loglevel', 'error',
             '-loop', '1', '-framerate', str(FPS), '-i', str(SOURCE),
             '-filter_complex_threads', '2', '-filter_complex', graph(),
             '-map', '[out]', '-t', str(DURATION), '-r', str(FPS), '-an',
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
             '-profile:v', 'high', '-level:v', '3.1', '-pix_fmt', 'yuv420p',
             '-maxrate', '900k', '-bufsize', '900k',
             '-movflags', '+faststart', '-map_metadata', '-1',
             '-metadata', 'title=NEXO - Abertura de marca',
             '-metadata', 'comment=Original NEXO brand motion composition; silent.',
             str(OUTPUT)])
    report = inspect(exe)
    if args.proof:
        PROOFS.mkdir(parents=True, exist_ok=True)
        run([exe, '-y', '-hide_banner', '-loglevel', 'error', '-i', str(OUTPUT),
             '-vf', 'fps=1,scale=480:270,tile=2x2', '-frames:v', '1',
             '-q:v', '2', str(PROOFS / 'video-contato.jpg')])
        (PROOFS / 'video-metadata.json').write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
