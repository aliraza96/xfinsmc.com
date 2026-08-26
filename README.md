# xfinsmc.com — XFinCom Apps

Static marketing site for XFinCom Apps, served by **GitHub Pages** on the apex
domain `xfinsmc.com`. Previously hosted on Firebase Hosting.

## Structure

```
index.html                  Home
privacy-policy.html         Privacy Policy
terms-and-conditions.html   Terms & Conditions
assets/css/style.css        All styles (single stylesheet)
assets/js/main.js           Mobile nav + contact form (mailto handoff)
assets/img/                 Logos, hero illustration, project + tech marks
assets/fonts/               Sofia Pro (woff)
CNAME                       Custom domain for GitHub Pages
.nojekyll                   Serve files as-is, skip Jekyll processing
```

No build step and no dependencies — every path is relative, so the site can be
opened straight from disk or served from any static host.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Any push to `main` is published by GitHub Pages automatically.

## Notes

- The contact form has no backend; it opens the visitor's mail client via
  `mailto:` to `info@xfinsmc.com`. The address is set in `assets/js/main.js`
  (`CONTACT_EMAIL`) and repeated in the two legal pages.
- All three pages currently carry `<meta name="robots" content="noindex, follow">`,
  which keeps the site out of search results. Remove it when you want the site indexed.
