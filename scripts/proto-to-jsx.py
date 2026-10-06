"""Converts a prototype HTML fragment into JSX. Mechanical, so the copy and the
   structure stay exactly as approved; only the plumbing changes."""
import re, sys, pathlib, html as htmllib

PAGE_HREF = {
    'index.html': '/', 'how-it-works.html': '/how-it-works', 'about.html': '/about',
    'service-areas.html': '/service-areas', 'contact.html': '/contact',
    'services/index.html': '/services', '404.html': '/404',
}

def convert(frag: str) -> str:
    s = frag
    # icons -> <Icon name="..." />
    s = re.sub(r'<svg[^>]*class="icon icon-([a-z-]+)"[^>]*>.*?</svg>', r'<Icon name="\1" />', s, flags=re.S)
    s = re.sub(r'<svg[^>]*>.*?</svg>', '', s, flags=re.S)
    # links
    s = s.replace('href="https://verliks.com/request"', 'href="/request"')
    s = s.replace('href="services/index.html"', 'href="/services"').replace('href="../services/index.html"', 'href="/services"')
    s = re.sub(r'href="(?:\.\./)?services/([a-z-]+)\.html"', r'href="/services/\1"', s)
    for k, v in PAGE_HREF.items():
        s = s.replace(f'href="{k}"', f'href="{v}"').replace(f'href="../{k}"', f'href="{v}"')
    # images
    s = s.replace('src="assets/images/', 'src="/images/site/').replace('src="../assets/images/', 'src="/images/site/')
    s = s.replace('srcset="assets/images/', 'srcset="/images/site/').replace('srcset="../assets/images/', 'srcset="/images/site/')
    s = s.replace('../assets/images/', '/images/site/').replace('assets/images/', '/images/site/')
    # <option selected> is a React warning; the form components set defaultValue
    s = re.sub(r'\s+selected(?=[\s>])', '', s)
    # attributes
    for a, b in (('class=', 'className='), ('srcset=', 'srcSet='), ('tabindex=', 'tabIndex='),
                 ('fetchpriority=', 'fetchPriority='), ('for=', 'htmlFor='), ('maxlength=', 'maxLength='),
                 ('autocomplete=', 'autoComplete='), ('novalidate', 'noValidate'), ('readonly', 'readOnly'),
                 ('colspan=', 'colSpan='), ('rowspan=', 'rowSpan='),
                 ('inputmode=', 'inputMode='), ('autocapitalize=', 'autoCapitalize='),
                 ('spellcheck=', 'spellCheck='), ('enterkeyhint=', 'enterKeyHint='),
                 ('autocorrect=', 'autoCorrect='), ('datetime=', 'dateTime=')):
        s = s.replace(a, b)
    # inline custom properties -> style objects
    def style_obj(m):
        decls = [d for d in m.group(1).split(';') if d.strip()]
        pairs = []
        for d in decls:
            k, _, v = d.partition(':')
            k, v = k.strip(), v.strip()
            key = f"'{k}'" if k.startswith('--') else re.sub(r'-([a-z])', lambda x: x.group(1).upper(), k)
            pairs.append(f"{key}: '{v}'")
        return 'style={{ ' + ', '.join(pairs) + ' } as React.CSSProperties}'
    s = re.sub(r'style="([^"]*)"', style_obj, s)
    # numeric attributes React wants as numbers, not strings
    for attr in ('rows', 'cols', 'size', 'maxLength', 'tabIndex', 'span'):
        s = re.sub(rf'\b{attr}="(-?\d+)"', rf'{attr}={{\1}}', s)
    # boolean attributes React needs as expressions
    s = re.sub(r'\bhidden(?=[\s>])', 'hidden', s)
    # self-closing voids
    s = re.sub(r'<(img|input|br|hr|source|meta|link)\b([^>]*?)\s*/?>', r'<\1\2 />', s)
    # entities that JSX renders literally
    s = s.replace('&amp;', '&').replace('&nbsp;', ' ').replace('&hellip;', '…')
    s = s.replace('&rsquo;', '’').replace('&lsquo;', '‘')
    s = s.replace('&ldquo;', '“').replace('&rdquo;', '”')
    # comments
    s = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', s, flags=re.S)
    return s

if __name__ == '__main__':
    src, tag = sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'main'
    doc = pathlib.Path(src).read_text()
    m = re.search(rf'(<{tag}\b.*?</{tag}>)', doc, re.S)
    print(convert(m.group(1)))
