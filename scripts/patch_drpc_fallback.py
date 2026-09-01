#!/usr/bin/env python3
"""Session 73: harden wNUT RPC tape — add base.drpc.org as getLogs-capable fallback + pin in test."""
import pathlib

ROOT = pathlib.Path('/a0/usr/projects/peanutoshi')

OLD_RPC = """const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.publicnode.com',
];"""

NEW_RPC = """const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.drpc.org', // keyless getLogs-capable fallback (verified 2026-09-01)
  'https://base.publicnode.com',
];"""

OLD_TEST = "ok(wnutSourcesSrc.includes('eth_getLogs'), 'wnut sources missing eth_getLogs');"

NEW_TEST = """ok(wnutSourcesSrc.includes('eth_getLogs'), 'wnut sources missing eth_getLogs');
ok(wnutSourcesSrc.includes('base.drpc.org'), 'wnut sources missing keyless drpc fallback RPC');"""

ops = [
    ('site/utils/wnutDataSources.js', OLD_RPC, NEW_RPC, 1),
    ('site/tests/groveRevisions.test.mjs', OLD_TEST, NEW_TEST, 1),
]

fails = []
for rel, old, new, expected in ops:
    p = ROOT / rel
    s = p.read_text()
    n = s.count(old)
    if n != expected:
        fails.append(f'{rel}: expected {expected}, found {n}')
        continue
    p.write_text(s.replace(old, new))
    print(f'OK {rel}')

if fails:
    for f in fails:
        print('FAIL', f)
    raise SystemExit(1)
print('hardening applied')
