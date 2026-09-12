# Deploying xfinsmc.com — Firebase ➜ GitHub Pages

Repo: https://github.com/aliraza96/xfinsmc.com
Pages: enabled, source = `main` branch, root (`/`), custom domain `xfinsmc.com`

The site is already built and serving from GitHub. The only remaining step is
repointing DNS at Namecheap.

---

## 1. Namecheap DNS changes

Namecheap dashboard ➜ **Domain List** ➜ `xfinsmc.com` ➜ **Manage** ➜ **Advanced DNS**.

### Remove these (Firebase)

| Type  | Host | Value                  |
|-------|------|------------------------|
| A     | `@`  | `199.36.158.100`       |
| CNAME | `www`| `xfinsmc-site.web.app` |

### Add these (GitHub Pages)

| Type  | Host  | Value                | TTL       |
|-------|-------|----------------------|-----------|
| A     | `@`   | `185.199.108.153`    | Automatic |
| A     | `@`   | `185.199.109.153`    | Automatic |
| A     | `@`   | `185.199.110.153`    | Automatic |
| A     | `@`   | `185.199.111.153`    | Automatic |
| CNAME | `www` | `aliraza96.github.io.` | Automatic |

All four A records are required — they are GitHub's redundant edge servers.
The `www` CNAME must point at the **account** host (`aliraza96.github.io`),
not the repo, and GitHub will redirect `www` ➜ apex automatically.

Optional IPv6 (AAAA on `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`

### DO NOT TOUCH — Zoho Mail

Deleting any of these breaks email to `info@xfinsmc.com`:

| Type | Host | Value                                            |
|------|------|--------------------------------------------------|
| MX   | `@`  | `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50) |
| TXT  | `@`  | `v=spf1 include:zohomail.com ~all`               |
| TXT  | `@`  | `zoho-verification=zb60831424.zmverify.zoho.com` |

Also remove any Namecheap **URL Redirect Record** or parking record on `@`/`www`,
which would otherwise override the A/CNAME records above.

### Safe to remove after cutover

| Type | Host | Value                        |
|------|------|------------------------------|
| TXT  | `@`  | `hosting-site=xfinsmc-site`  | (Firebase-only, unused by GitHub) |

---

## 2. Enable HTTPS

DNS must propagate first (usually 30 min, up to 24 h). Then:

GitHub repo ➜ **Settings** ➜ **Pages** ➜ tick **Enforce HTTPS**.

The checkbox stays greyed out until GitHub finishes issuing the Let's Encrypt
certificate, which it does automatically once the A records resolve to GitHub.

Or via CLI:

```bash
gh api -X PUT repos/aliraza96/xfinsmc.com/pages -F https_enforced=true
```

---

## 3. Verify

Check DNS has moved:

```bash
dig +short xfinsmc.com A      # expect the four 185.199.x.153 addresses
dig +short www.xfinsmc.com    # expect aliraza96.github.io
```

Check the site (works even before DNS propagates):

```bash
curl -sI --resolve xfinsmc.com:80:185.199.108.153 http://xfinsmc.com/
```

Confirm mail still flows by sending a test message to `info@xfinsmc.com`.

---

## 4. Decommission Firebase

Only after `xfinsmc.com` is confirmed serving from GitHub over HTTPS, and email
is verified working. In the Firebase console, remove the custom domain from the
`xfinsmc-site` Hosting site. Leave the Firebase project itself alone if anything
else depends on it.

---

## Rollback

Restore the two original records and the site returns to Firebase:

| Type  | Host  | Value                  |
|-------|-------|------------------------|
| A     | `@`   | `199.36.158.100`       |
| CNAME | `www` | `xfinsmc-site.web.app` |

## Publishing future changes

```bash
git add -A && git commit -m "your message" && git push
```

GitHub Pages rebuilds automatically, typically within a minute.

---

## Troubleshooting: certificate never provisions

Symptom: `https://xfinsmc.com` shows a browser security warning, and the served
certificate is `CN=*.github.io` rather than `CN=xfinsmc.com`.

Cause: the custom domain was attached to Pages *before* DNS pointed at GitHub,
so GitHub's first domain validation failed and the retry did not fire. The API
reports `https_certificate: null`.

Fix — detach and reattach the domain to force fresh validation:

```bash
echo '{"cname":null}'            | gh api -X PUT repos/aliraza96/xfinsmc.com/pages --input -
echo '{"cname":"xfinsmc.com"}'   | gh api -X PUT repos/aliraza96/xfinsmc.com/pages --input -
```

Then wait for the cert and enable enforcement:

```bash
gh api repos/aliraza96/xfinsmc.com/pages --jq '.https_certificate.state'   # approved
echo '{"https_enforced":true}' | gh api -X PUT repos/aliraza96/xfinsmc.com/pages --input -
```

Two gotchas:

- **Send `cname` and `https_enforced` in separate requests.** A PUT containing
  `https_enforced` while no certificate exists fails with
  `404 The certificate does not exist yet` — and that failure can block the
  `cname` update in the same call, leaving the domain detached and the site 404ing.
- **Use `--input -` with JSON, not `-f`/`-F`.** The `-f cname=...` form did not
  persist reliably here; the JSON body did.

Detaching the domain takes the site offline until it is reattached, and the edge
needs 2-3 minutes afterwards to serve the homepage again. Do it deliberately.
