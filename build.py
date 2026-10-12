# /// script
# dependencies = ["markdown>=3.6", "pygments>=2.18"]
# ///
"""Build your-moon.github.io: renders the posts below into _site/.

    node diagrams/render.mjs && uv run build.py   (cd diagrams && npm i once)
    Pushing to main deploys via .github/workflows/pages.yml.
"""
import datetime as dt
import os
import html
import re
import shutil
from pathlib import Path

import markdown
from pygments.formatters import HtmlFormatter

ROOT = Path(__file__).parent
OUT = Path(os.environ.get("BLOG_OUT") or ROOT / "_site")  # BLOG_OUT lets parallel previews not clobber each other
SITE = "https://your-moon.github.io"
AUTHOR = "Munkherdene"
UI = {
    "en": dict(home="/", blurb="Notes from trying to understand how computers actually work — from one line of code down to the CPU.",
               by="{name}'s blog.", read="min read", prev="← Previous", next="Next →", other="", title="Blog", in_mn="in Mongolian", about="About", about_url="/about/"),
    "mn": dict(home="/mn/", blurb="Компьютер яг яаж ажилладгийг ойлгох гэсэн миний тэмдэглэлүүд.",
               by="{name}-ийн блог.", read="мин унших", prev="← Өмнөх", next="Дараах →", other="Англи хэлээр (орчуулагдаагүй)", title="Блог", in_en="англиар", about="About", about_url="/about/"),
}
BLURB = UI["en"]["blurb"]

# Order shown on the index. (file, series, lang, date[, slug of the same post in the other language])
POSTS = [
    ("craft-1-complexity.md", "Craft", "en", "2026-10-08"),
    ("craft-2-tests.md", "Craft", "en", "2026-10-08"),
    ("craft-3-existing-code.md", "Craft", "en", "2026-10-08"),
    ("craft-4-production.md", "Craft", "en", "2026-10-08"),
    ("s1-1-interpreter.md", "Season 1 · Cecile", "en", "2026-08-29", "programming-language-part1-mn"),
    ("s1-2-virtual-machine.md", "Season 1 · Cecile", "en", "2026-08-29", "s1-2-virtual-machine-mn"),
    ("s2-1-compiler.md", "Season 2 · To the Metal", "en", "2026-08-29"),
    ("s2-2-llvm.md", "Season 2 · To the Metal", "en", "2026-08-29"),
    ("s2-3-assembly.md", "Season 2 · To the Metal", "en", "2026-08-29"),
    ("s2-4-syscalls.md", "Season 2 · To the Metal", "en", "2026-08-29"),
    ("s2-5-gdb.md", "Season 2 · To the Metal", "en", "2026-08-29"),
    ("s2-6-linking.md", "Season 2 · To the Metal", "en", "2026-08-29"),
    ("s2-7-loading.md", "Season 2 · To the Metal", "en", "2026-08-29"),
    ("programming-language-part1-mn.md", "1-р улирал · Cecile", "mn", "2026-08-29", "s1-1-interpreter"),
    ("s1-2-virtual-machine-mn.md", "1-р улирал · Cecile", "mn", "2026-08-29", "s1-2-virtual-machine"),
]

# Fonts are self-hosted (static/fonts, Latin + Cyrillic subsets only) with font-display:swap.
# Not `optional`: measured, a first visit gets the fonts in ~360 ms, past optional's ~100 ms window, so
# every first-time reader saw the whole page in the fallback fonts. Swap costs a small re-wrap (CLS ~0.1
# on two posts) — the size-matched fallbacks below keep it that small.
# No preloads: measured with Lighthouse (mobile), preloading made first paint slower (MN post 3.0 s
# → 1.2 s without), because the font competed with the page itself on a slow connection.
PRELOAD = {
    "en": [],
    "mn": [],
}
STYLE = ""  # filled in main(): fonts + site CSS + code highlighting, inlined into every page

CSS = """
@font-face{font-family:'Excalifont MN';src:url(/fonts/excalifont-mn.woff2) format('woff2');font-display:swap}
:root{--xd-paper:var(--bg);--xd-ink:#1e1e1e;--xd-muted:#6b6b6b;--xd-blue:#a5d8ff;--xd-green:#b2f2bb;--xd-yellow:#ffec99;--xd-red:#ffc9c9;--xd-violet:#d0bfff;--xd-gray:#e9ecef;--xd-orange:#ffd8a8;
  --xd-blue-ink:#4dabf7;--xd-green-ink:#40c057;--xd-yellow-ink:#fab005;--xd-red-ink:#fa5252;--xd-violet-ink:#9775fa;--xd-gray-ink:#adb5bd;--xd-orange-ink:#fd7e14}
:root[data-theme=dark]{--xd-ink:#e4e4e4;--xd-muted:#9a9a9a;--xd-blue:#1c3d5a;--xd-green:#1f4329;--xd-yellow:#4a3f12;--xd-red:#4f2626;--xd-violet:#36295c;--xd-gray:#2a2a2a;--xd-orange:#4d3318}
figure.diagram{margin:2em 0 2.2em;text-align:center}
figure.diagram svg{max-width:100%;height:auto}
@media (max-width:720px){figure.diagram{overflow-x:auto;margin-left:-16px;margin-right:-16px;padding:0 16px}figure.diagram svg{min-width:var(--w)}}
.footnote{font-size:.82em;line-height:1.6;color:var(--muted)}.footnote hr{display:none}.footnote li{margin:.4em 0}sup a.footnote-ref{text-decoration:none;font-size:.8em}
figure.diagram figcaption{font:14px/1.4 Inter,'Inter Fallback',system-ui,sans-serif;color:var(--muted);margin-top:8px}
:root{--bg:#fdfcfa;--fg:#1a1a1a;--muted:#737373;--line:#e8e6e1;--accent:#111;--head:#111;--code-bg:#f4f3f0;--inline:#efede8;--quote:#f6f5f2}
:root[data-theme=dark]{--bg:#141414;--fg:#e4e4e4;--muted:#949494;--line:#2c2c2c;--accent:#f2f2f2;--head:#fafafa;--code-bg:#1d1d1d;--inline:#262626;--quote:#1b1b1b}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:19px/1.75 Merriweather,'Merriweather Fallback',Georgia,serif;font-weight:300;transition:background .2s,color .2s}
.wrap{max-width:672px;margin:0 auto;padding:40px 16px 80px}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px}
.brand{font:800 22px/1 Inter,'Inter Fallback',system-ui,sans-serif;letter-spacing:-.02em;color:var(--head);text-decoration:none}
.brand.small{font-size:20px}
.tools{display:flex;gap:8px;align-items:center}
.tools a.nav{font:600 14px Inter,'Inter Fallback',system-ui,sans-serif;color:var(--fg);text-decoration:none;margin-right:6px}
.tools a.nav:hover{text-decoration:underline;text-underline-offset:3px}
.lang{display:flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;font:600 13px/1 Inter,'Inter Fallback',system-ui,sans-serif}
.lang a{padding:12px 12px;color:var(--muted);text-decoration:none}
.lang a.on{background:var(--accent);color:var(--bg)}
.tag{font:600 11px/1 Inter,'Inter Fallback',system-ui,sans-serif;border:1px solid var(--line);border-radius:4px;padding:2px 5px;margin-left:6px;color:var(--muted);vertical-align:middle}
.toggle{background:none;border:1px solid var(--line);border-radius:999px;width:40px;height:40px;cursor:pointer;font-size:18px;color:var(--fg)}
.bio{display:flex;gap:14px;align-items:center;margin-bottom:40px;font-size:15px;line-height:1.6}
.avatar{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:var(--inline)}
.bio p{margin:0}
.series{font:600 12px/1 Inter,'Inter Fallback',system-ui,sans-serif;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin:40px 0 4px}
article.card{margin:20px 0 28px}
article.card h3{margin:0 0 4px;font:700 19px/1.3 Inter,'Inter Fallback',system-ui,sans-serif;letter-spacing:-.01em}
article.card h3 a{color:var(--head);text-decoration:none}
article.card h3 a:hover{text-decoration:underline;text-underline-offset:4px}
article.card small{font:13px Inter,'Inter Fallback',system-ui,sans-serif;color:var(--muted)}
article.card p{margin:4px 0 0;font-size:15px;line-height:1.55;color:var(--muted)}
.post-head h1{font:800 44px/1.15 Inter,'Inter Fallback',system-ui,sans-serif;letter-spacing:-.025em;color:var(--head);margin:0 0 12px}
.post-head .meta{font:14px Inter,'Inter Fallback',system-ui,sans-serif;color:var(--muted);margin-bottom:40px}
.post-head .meta b{color:var(--fg);font-weight:600}
.content h1:first-child{display:none}
.content.about h1 .anchor{display:none}
.content.about h1:first-child{display:block;font:800 40px/1.15 Inter,'Inter Fallback',system-ui,sans-serif;letter-spacing:-.025em;color:var(--head);margin:0 0 24px}
.content>p:first-of-type em:only-child{display:none}
.content h2{font:800 28px/1.3 Inter,'Inter Fallback',system-ui,sans-serif;letter-spacing:-.015em;color:var(--head);margin:2.2em 0 .6em}
.content h3{font:800 22px/1.3 Inter,'Inter Fallback',system-ui,sans-serif;color:var(--head);margin:1.8em 0 .5em}
.content a{color:var(--accent);text-decoration:underline;text-decoration-color:var(--muted);text-underline-offset:3px}
.content a:hover{text-decoration-color:currentColor}
.content strong{font-weight:700}
.content p,.content ul,.content ol{margin:0 0 1.6em}
.content li{margin:.3em 0}
.content blockquote{margin:0 0 1.6em -24px;padding:4px 20px;border-left:3px solid var(--line);background:var(--quote);font-style:italic}
.content blockquote p{margin:.6em 0}
.content hr{border:0;margin:3em 0;text-align:center}
.content hr::before{content:"· · ·";color:var(--muted);letter-spacing:.6em}
.content img{max-width:100%;border-radius:6px}
.content table{border-collapse:collapse;display:block;overflow-x:auto;font:15px/1.5 Inter,'Inter Fallback',system-ui,sans-serif;margin:0 0 1.6em}
.content th,.content td{border-bottom:1px solid var(--line);padding:8px 12px;text-align:left}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.82em;font-variant-ligatures:none}
:not(pre)>code{background:var(--inline);padding:.15em .35em;border-radius:4px}
.codehilite{background:var(--code-bg)!important;border-radius:10px;margin:0 -24px 1.6em;overflow-x:auto}
.codehilite pre{margin:0;padding:20px 24px;font-size:15px;line-height:1.6}
.codehilite code{font-size:inherit}
.next{display:flex;justify-content:space-between;gap:24px;margin-top:64px;padding-top:32px;border-top:1px solid var(--line);font:600 16px/1.4 Inter,'Inter Fallback',system-ui,sans-serif}
.next a{color:var(--accent);text-decoration:none}
.next span{display:block;font-weight:400;font-size:13px;color:var(--muted);margin-bottom:4px}
.next div:last-child{text-align:right}
footer{margin-top:64px;font:14px Inter,'Inter Fallback',system-ui,sans-serif;color:var(--muted)}
footer a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.content h2 .anchor,.content h3 .anchor{margin-left:.4em;color:var(--muted);text-decoration:none;box-shadow:none;opacity:0;font-weight:400}
.content h2:hover .anchor,.content h3:hover .anchor,.content .anchor:focus{opacity:1}
@media (max-width:720px){body{font-size:17px}.post-head h1{font-size:34px}.codehilite{margin:0 -16px 1.6em;border-radius:0}.content blockquote{margin-left:-16px}}
"""

THEME_JS = """<script>(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}
if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
document.documentElement.dataset.theme=t})();
function flip(){var d=document.documentElement,t=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=t;
try{localStorage.setItem('theme',t)}catch(e){}}</script>"""


def pygments_css():
    light = HtmlFormatter(style="github-light" if _has("github-light") else "friendly").get_style_defs(":root:not([data-theme=dark]) .codehilite")
    dark = HtmlFormatter(style="one-dark" if _has("one-dark") else "monokai").get_style_defs(":root[data-theme=dark] .codehilite")
    return light + dark


def _has(style):
    from pygments.styles import get_all_styles
    return style in get_all_styles()


def page(title, body, lang="en", desc=BLURB, small=False, alt=None, path="/"):
    brand = f'<a class="brand{" small" if small else ""}" href="{UI[lang]["home"]}">{AUTHOR}</a>'
    alt = alt or {"en": "/", "mn": "/mn/"}
    switch = '<nav class="lang">' + "".join(
        f'<a href="{alt[l]}" hreflang="{l}" class="{"on" if l == lang else ""}">{lab}</a>' for l, lab in (("en", "EN"), ("mn", "МН"))) + "</nav>"
    return f"""<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title_text(title))}</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="{html.escape(title_text(title))}"><meta property="og:description" content="{html.escape(desc)}">
<link rel="canonical" href="{SITE}{path}"><meta property="og:url" content="{SITE}{path}"><meta property="og:type" content="{"article" if small else "website"}">
<link rel="alternate" type="application/rss+xml" title="{AUTHOR}" href="/rss.xml">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥕</text></svg>">
{"".join(f'<link rel="preload" href="/fonts/{f}" as="font" type="font/woff2" crossorigin>' for f in PRELOAD[lang])}
<style>{STYLE}</style>{THEME_JS}</head>
<body><div class="wrap"><header class="top">{brand}<div class="tools"><a class="nav" href="{UI[lang]["about_url"]}">{UI[lang]["about"]}</a>{switch}<button class="toggle" onclick="flip()" aria-label="Toggle dark mode">◐</button></div></header>
{body}
<footer><a href="/rss.xml">RSS</a> · © {dt.date.today().year} {AUTHOR}</footer></div></body></html>
"""


def meta(text):
    title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
    sub = re.search(r"^\*([^*].+?)\*\s*$", text, re.M)
    sub = sub.group(1) if sub else ""
    # First real paragraph after the subtitle, for the index blurb.
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    blurb = next((p for p in paras if not p.startswith(("#", "*", "```", ">", "-", "|")) and len(p) > 80), "")
    blurb = re.sub(r"[*_`]|\[([^\]]+)\]\([^)]+\)", lambda m: m.group(1) or "", blurb)
    if len(blurb) > 220:
        blurb = blurb[:220].rsplit(" ", 1)[0] + "…"
    return title, sub, blurb


DIAGRAM = re.compile(r"^!\[([^\]]*)\]\(diagrams/([\w.-]+)\.svg\)\s*$", re.M)


def inline_diagrams(text, lang):
    """Swap `![caption](diagrams/name.svg)` for the inline SVG (so it follows the theme)."""
    def sub(m):
        out = ROOT / "diagrams" / "out"
        f = out / f"{m.group(2)}.{lang}.svg"
        if not f.exists():
            f = out / f"{m.group(2)}.svg"
        cap = f"<figcaption>{html.escape(m.group(1))}</figcaption>" if m.group(1) else ""
        svg = f.read_text().strip()
        # On phones keep diagrams from shrinking past legibility; the figure scrolls sideways instead.
        w = int(re.search(r'width="(\d+)"', svg).group(1))
        style = "" if 'data-fit="1"' in svg else f' style="--w:{min(w, 560)}px"'
        return f'<figure class="diagram"{style}>{svg}{cap}</figure>'
    return DIAGRAM.sub(sub, text)


def title_html(t):
    """Title for display: `code` spans become <code>, everything else escaped."""
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", html.escape(t))


def title_text(t):
    """Title for <title>, og:title and RSS: plain text, no backticks."""
    return t.replace("`", "")


def minutes(text):
    return max(1, round(len(re.findall(r"\w+", text)) / 230))


def fmt(d, lang="en"):
    x = dt.date.fromisoformat(d)
    return f"{x.year} оны {x.month}-р сарын {x.day}" if lang == "mn" else x.strftime("%B %-d, %Y")


def main():
    shutil.rmtree(OUT, ignore_errors=True)
    OUT.mkdir()
    global STYLE
    # Pygments' comment grey is 4.49:1 on our code background, just under WCAG AA; darken it.
    comments = (":root:not([data-theme=dark]) .codehilite :is(.c,.c1,.cm,.ch,.cs,.cp){color:#5c6370}"
                ":root[data-theme=dark] .codehilite :is(.c,.c1,.cm,.ch,.cs,.cp){color:#9aa1ad}")
    # Fallbacks scaled to the web fonts' measured widths (Inter 800 ≈ 1.031× Arial, Merriweather ≈ 1.006×
    # Georgia), so text doesn't re-wrap and shift the page when the real font swaps in.
    fallbacks = ("@font-face{font-family:'Inter Fallback';src:local('Arial');size-adjust:103.1%}"
                 "@font-face{font-family:'Merriweather Fallback';src:local('Georgia');size-adjust:100.6%}")
    STYLE = fallbacks + (ROOT / "static" / "fonts" / "fonts.css").read_text() + CSS + pygments_css() + comments
    shutil.copytree(ROOT / "static", OUT, dirs_exist_ok=True)

    posts = []
    for f, series, lang, date, *pair in POSTS:
        text = (ROOT / f).read_text()
        title, sub, blurb = meta(text)
        posts.append(dict(slug=Path(f).stem, title=title, sub=sub, blurb=blurb, series=series,
                          lang=lang, date=date, mins=minutes(text), text=text, pair=pair[0] if pair else None))

    from markdown.extensions.toc import slugify_unicode
    md_ext = ["fenced_code", "tables", "sane_lists", "codehilite", "toc", "footnotes"]
    md_cfg = {"codehilite": {"guess_lang": False, "css_class": "codehilite"},
              "toc": {"slugify": slugify_unicode, "permalink": "#", "permalink_class": "anchor", "toc_depth": "2-3"}}
    for p in posts:
        same = [q for q in posts if q["lang"] == p["lang"]]
        i = same.index(p)
        u = UI[p["lang"]]
        body = markdown.markdown(inline_diagrams(p["text"], p["lang"]), extensions=md_ext, extension_configs=md_cfg)
        prev = same[i - 1] if i > 0 else None
        nxt = same[i + 1] if i + 1 < len(same) else None
        # A translated post with no neighbour in its own language continues the series through
        # its counterpart's neighbours (e.g. Mongolian Part 1 → English Part 2).
        if p["pair"] and (prev is None or nxt is None):
            twin = next(q for q in posts if q["slug"] == p["pair"])
            seq = [q for q in posts if q["lang"] == twin["lang"]]
            j = seq.index(twin)
            prev = prev or (seq[j - 1] if j > 0 else None)
            nxt = nxt or (seq[j + 1] if j + 1 < len(seq) else None)

        def link(q, label):
            if not q:
                return ""
            if q["lang"] != p["lang"]:
                note = f'({u["in_" + q["lang"]]})'
                label = label[:-1] + note + " →" if label.endswith("→") else f"{label} {note}"
            return f'<span>{label}</span><a href="/{q["slug"]}/">{title_html(q["title"])}</a>'
        head = (f'<header class="post-head"><h1>{title_html(p["title"])}</h1>'
                f'<div class="meta"><b>{AUTHOR}</b> · {fmt(p["date"], p["lang"])} · ☕ {p["mins"]} {u["read"]} · {html.escape(p["series"])}</div></header>')
        nav = f'<nav class="next"><div>{link(prev, u["prev"])}</div><div>{link(nxt, u["next"])}</div></nav>'
        other = "mn" if p["lang"] == "en" else "en"
        alt = {p["lang"]: f'/{p["slug"]}/', other: f'/{p["pair"]}/' if p["pair"] else UI[other]["home"]}
        d = OUT / p["slug"]
        d.mkdir()
        (d / "index.html").write_text(page(p["title"], f'<main>{head}<div class="content">{body}</div>{nav}</main>',
                                           p["lang"], p["sub"] or u["blurb"], small=True, alt=alt, path=f'/{p["slug"]}/'))
        p["html"] = body

    for lang in ("en", "mn"):
        u = UI[lang]
        idx = f'<aside class="bio"><div class="avatar">🥕</div><p>{u["by"].format(name=f"<b>{AUTHOR}</b>")}</p></aside><main>'
        own = [p for p in posts if p["lang"] == lang]
        rest = [p for p in posts if p["lang"] != lang and not p["pair"]] if lang == "mn" else []
        last = None
        for p in own + rest:
            series = p["series"] if p in own else u["other"]
            if series != last:
                idx += f'<div class="series">{html.escape(series)}</div>'
                last = series
            tag = '<span class="tag">EN</span>' if p not in own else ""
            idx += (f'<article class="card"><h3><a href="/{p["slug"]}/">{title_html(p["title"])}</a>{tag}</h3>'
                    f'<small>{fmt(p["date"], lang)} · ☕ {p["mins"]} {u["read"]}</small><p>{html.escape(p["sub"] or p["blurb"])}</p></article>')
        d = OUT / u["home"].strip("/")
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(page(f"{AUTHOR} — {u['title']}", idx + "</main>", lang, u["blurb"], path=u["home"]))

    items = "".join(
        f"<item><title>{html.escape(title_text(p['title']))}</title><link>{SITE}/{p['slug']}/</link><guid>{SITE}/{p['slug']}/</guid>"
        f"<pubDate>{dt.datetime.fromisoformat(p['date']).strftime('%a, %d %b %Y 00:00:00 +0000')}</pubDate>"
        f"<description>{html.escape(p['html'])}</description></item>" for p in posts if p["lang"] == "en")
    (OUT / "rss.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>{AUTHOR}</title>'
                                 f"<link>{SITE}</link><description>{html.escape(BLURB)}</description>{items}</channel></rss>")
    # About is English only; Mongolian pages link to it too, and its МН switch goes to the Mongolian home.
    for lang, src in (("en", "about.md"),):
        u = UI[lang]
        body = markdown.markdown((ROOT / "pages" / src).read_text(), extensions=md_ext, extension_configs=md_cfg)
        title = re.search(r"^# (.+)$", (ROOT / "pages" / src).read_text(), re.M).group(1)
        d = OUT / u["about_url"].strip("/"); d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(page(f"{title} — {AUTHOR}", f'<main><div class="content about">{body}</div></main>',
                                           lang, u["blurb"], alt={"en": "/about/", "mn": "/mn/"}, path=u["about_url"]))
    urls = ["/", "/mn/", "/about/"] + [f"/{p['slug']}/" for p in posts]
    (OUT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                                     + "".join(f"<url><loc>{SITE}{u}</loc></url>" for u in urls) + "</urlset>")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n")
    nf = ('<main><header class="post-head"><h1>404</h1></header><div class="content"><p>This page doesn\'t exist. <a href="/">Back to the blog</a>.</p>'
          '<p lang="mn">Ийм хуудас байхгүй байна. <a href="/mn/">Блог руу буцах</a>.</p></div></main>')
    (OUT / "404.html").write_text(page(f"404 — {AUTHOR}", nf, "en", "Page not found", path="/404.html"))
    print(f"built {len(posts)} posts -> {OUT}")


if __name__ == "__main__":
    main()
