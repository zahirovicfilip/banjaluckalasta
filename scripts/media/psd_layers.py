"""Minimal PSD layer extractor (8-bit RGB, raw/RLE channels) -> RGBA PNGs. No dependencies."""
import struct, sys, zlib, os

def packbits(data, expected):
    out = bytearray(); i = 0; n = len(data)
    while i < n and len(out) < expected:
        h = data[i]; i += 1
        if h < 128:
            out += data[i:i + h + 1]; i += h + 1
        elif h > 128:
            out += bytes([data[i]]) * (257 - h); i += 1
    return bytes(out[:expected])

def write_png(path, w, h, rgba):
    def chunk(tag, body):
        return struct.pack('>I', len(body)) + tag + body + struct.pack('>I', zlib.crc32(tag + body) & 0xffffffff)
    stride = w * 4
    raw = bytearray()
    for y in range(h):
        raw.append(0); raw += rgba[y * stride:(y + 1) * stride]
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(raw), 6)) + chunk(b'IEND', b'')
    open(path, 'wb').write(png)

def main(path, outdir, only=None):
    f = open(path, 'rb')
    sig, ver = struct.unpack('>4sH', f.read(6)); f.read(6)
    channels, H, W, depth, mode = struct.unpack('>HIIHH', f.read(14))
    print(f'PSD {W}x{H} depth={depth} mode={mode} channels={channels} ver={ver}')
    assert sig == b'8BPS' and ver == 1 and depth == 8
    f.seek(struct.unpack('>I', f.read(4))[0], 1)   # color mode data
    f.seek(struct.unpack('>I', f.read(4))[0], 1)   # image resources
    lm_len = struct.unpack('>I', f.read(4))[0]; lm_end = f.tell() + lm_len
    li_len = struct.unpack('>I', f.read(4))[0]
    count = abs(struct.unpack('>h', f.read(2))[0])
    layers = []
    for _ in range(count):
        top, left, bottom, right, nch = struct.unpack('>iiiiH', f.read(18))
        chans = [struct.unpack('>hI', f.read(6)) for _ in range(nch)]
        bsig, bkey, opacity, clip, flags, _fill, extra = struct.unpack('>4s4sBBBBI', f.read(16))
        end = f.tell() + extra
        mlen = struct.unpack('>I', f.read(4))[0]; f.seek(mlen, 1)
        blen = struct.unpack('>I', f.read(4))[0]; f.seek(blen, 1)
        nlen = f.read(1)[0]; name = f.read(nlen).decode('mac_roman', 'replace')
        f.seek((4 - (nlen + 1) % 4) % 4, 1)
        kind = ''
        while f.tell() < end - 11:
            s, key, ln = struct.unpack('>4s4sI', f.read(12))
            pos = f.tell()
            if key == b'luni':
                n = struct.unpack('>I', f.read(4))[0]; name = f.read(n * 2).decode('utf-16-be', 'replace')
            if key in (b'SoLd', b'PlLd', b'SoLE'): kind = 'smart'
            if key == b'TySh': kind = 'text'
            if key == b'lsct':
                t = struct.unpack('>I', f.read(4))[0]; kind = {1: 'group-open', 2: 'group-closed', 3: 'group-end'}.get(t, kind)
            f.seek(pos + ln + (ln % 2), 0)
        f.seek(end)
        layers.append(dict(name=name, rect=(top, left, bottom, right), chans=chans, opacity=opacity, visible=not (flags & 2), kind=kind, blend=bkey.decode()))
    os.makedirs(outdir, exist_ok=True)
    for idx, L in enumerate(layers):
        top, left, bottom, right = L['rect']; w, h = right - left, bottom - top
        data = {}
        for cid, clen in L['chans']:
            start = f.tell()
            comp = struct.unpack('>H', f.read(2))[0]
            if cid in (-2, -3) or w <= 0 or h <= 0:
                f.seek(start + clen); continue
            if comp == 0:
                data[cid] = f.read(w * h)
            elif comp == 1:
                counts = struct.unpack('>' + 'H' * h, f.read(2 * h))
                rows = [packbits(f.read(c), w) for c in counts]
                data[cid] = b''.join(rows)
            else:
                data[cid] = None
            f.seek(start + clen)
        print(f"[{idx:02d}] {L['name']!r:40} {w}x{h} at ({left},{top}) op={L['opacity']} vis={L['visible']} kind={L['kind']} blend={L['blend']} ch={[c for c, _ in L['chans']]}")
        if w <= 0 or h <= 0 or any(data.get(c) is None for c in (0, 1, 2)): continue
        if only and idx not in only: continue
        r, g, b = data[0], data[1], data[2]; a = data.get(-1) or b'\xff' * (w * h)
        rgba = bytearray(w * h * 4)
        rgba[0::4] = r; rgba[1::4] = g; rgba[2::4] = b; rgba[3::4] = a
        safe = ''.join(ch if ch.isalnum() else '_' for ch in L['name'])[:30]
        write_png(os.path.join(outdir, f'{idx:02d}_{safe}.png'), w, h, bytes(rgba))

if __name__ == '__main__':
    only = set(int(x) for x in sys.argv[3].split(',')) if len(sys.argv) > 3 else None
    main(sys.argv[1], sys.argv[2], only)
