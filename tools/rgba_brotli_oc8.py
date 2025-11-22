#!/usr/bin/env python3
"""
RGBA + Brotli + OC8 encoder/decoder

Usage:
  python tools/rgba_brotli_oc8.py encode <input> <output_prefix> [--max-png-bytes N] [--brotli-quality Q]
  python tools/rgba_brotli_oc8.py decode <png_glob> <output>

Produces PNG parts named <output_prefix>_partNN.png
Requires: Pillow, brotli

Install:
  pip install Pillow brotli
"""

from __future__ import annotations
import argparse
import math
import struct
import os
from typing import List

from PIL import Image
import brotli


# CRC-8 (OC8) implementation
def crc8_oc8(data: bytes, poly: int = 0x07, init: int = 0x00) -> int:
    crc = init & 0xFF
    for b in data:
        crc ^= b
        for _ in range(8):
            if (crc & 0x80) != 0:
                crc = ((crc << 1) ^ poly) & 0xFF
            else:
                crc = (crc << 1) & 0xFF
    return crc & 0xFF


def pack_bytes_to_rgb(stream: bytes) -> bytes:
    pad = (3 - (len(stream) % 3)) % 3
    if pad:
        stream = stream + (b"\x00" * pad)
    return stream


def make_image_from_rgb(rgb_bytes: bytes, max_width: int = 4096) -> Image.Image:
    total_pixels = len(rgb_bytes) // 3
    if total_pixels == 0:
        raise ValueError("No pixels to encode")
    # choose width close to square but <= max_width
    width = min(max_width, max(1, int(math.sqrt(total_pixels))))
    height = math.ceil(total_pixels / width)
    required_pixels = width * height
    if required_pixels > total_pixels:
        missing = required_pixels - total_pixels
        rgb_bytes = rgb_bytes + (b"\x00" * (missing * 3))
    img = Image.frombytes("RGB", (width, height), rgb_bytes)
    return img


def extract_rgb_from_image(img: Image.Image) -> bytes:
    if img.mode != 'RGB':
        img = img.convert('RGB')
    return img.tobytes()


def encode_file_to_pngs(input_path: str, output_prefix: str, max_png_bytes: int = 200 * 1024 * 1024, brotli_quality: int = 11, max_width: int = 4096) -> List[str]:
    # read
    with open(input_path, 'rb') as f:
        raw = f.read()
    # compress
    compressed = brotli.compress(raw, quality=brotli_quality)
    # crc
    checksum = crc8_oc8(compressed)
    payload = compressed + bytes([checksum])
    N = len(payload)
    header = struct.pack('>Q', N)
    full = header + payload
    rgb_stream = pack_bytes_to_rgb(full)
    total_pixels = len(rgb_stream) // 3
    max_pixels_per_img = max(1, max_png_bytes // 3)
    num_images = max(1, math.ceil(total_pixels / max_pixels_per_img))

    out_paths: List[str] = []
    pixel_offset = 0
    for idx in range(num_images):
        pixels_in_chunk = min(max_pixels_per_img, total_pixels - pixel_offset)
        if pixels_in_chunk <= 0:
            break
        start = pixel_offset * 3
        end = start + pixels_in_chunk * 3
        chunk_rgb = rgb_stream[start:end]
        img = make_image_from_rgb(chunk_rgb, max_width=max_width)
        part_name = f"{output_prefix}_part{idx:02d}.png"
        # use low compression level for speed; Pillow uses optimize/quality differently
        img.save(part_name, format='PNG', compress_level=1)
        out_paths.append(part_name)
        pixel_offset += pixels_in_chunk
    return out_paths


def decode_pngs_to_file(png_paths: List[str], output_path: str) -> None:
    all_rgb = bytearray()
    for p in png_paths:
        img = Image.open(p)
        all_rgb.extend(extract_rgb_from_image(img))
    full = bytes(all_rgb)
    if len(full) < 8:
        raise ValueError('Stream too short')
    N = struct.unpack('>Q', full[:8])[0]
    payload_with_crc = full[8:8+N]
    if len(payload_with_crc) < 1:
        raise ValueError('Payload too short')
    compressed = payload_with_crc[:-1]
    checksum = payload_with_crc[-1]
    expected = crc8_oc8(compressed)
    if checksum != expected:
        raise ValueError(f'CRC mismatch: expected {expected}, got {checksum}')
    raw = brotli.decompress(compressed)
    with open(output_path, 'wb') as f:
        f.write(raw)


def main() -> None:
    p = argparse.ArgumentParser(description='RGBA Brotli OC8 encoder/decoder')
    sub = p.add_subparsers(dest='cmd', required=True)
    enc = sub.add_parser('encode')
    enc.add_argument('input')
    enc.add_argument('output_prefix')
    enc.add_argument('--max-png-bytes', type=int, default=200 * 1024 * 1024)
    enc.add_argument('--brotli-quality', type=int, default=11)
    dec = sub.add_parser('decode')
    dec.add_argument('png_glob')
    dec.add_argument('output')
    args = p.parse_args()

    if args.cmd == 'encode':
        outdir = os.path.dirname(args.output_prefix)
        if outdir and not os.path.exists(outdir):
            os.makedirs(outdir, exist_ok=True)
        paths = encode_file_to_pngs(args.input, args.output_prefix, max_png_bytes=args.max_png_bytes, brotli_quality=args.brotli_quality)
        print('Written PNG parts:')
        for pp in paths:
            print(' -', pp)
    elif args.cmd == 'decode':
        import glob
        pngs = sorted(glob.glob(args.png_glob))
        if not pngs:
            raise SystemExit(f'No PNGs match pattern: {args.png_glob}')
        decode_pngs_to_file(pngs, args.output)
        print('Reconstructed file:', args.output)


if __name__ == '__main__':
    main()
