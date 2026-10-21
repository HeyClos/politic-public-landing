"""Export the landing page for the existing FastAPI static/template layout."""
import argparse
import shutil
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path, help='New output directory; existing paths are refused')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = args.output.expanduser().resolve()
output.mkdir(parents=True, exist_ok=False)
templates = output / 'app' / 'templates'
templates.mkdir(parents=True)
html = (root / 'index.html').read_text()
html = html.replace('href="assets/', 'href="/static/rebrand/').replace('src="assets/', 'src="/static/rebrand/')
html = html.replace('https://politicpublic.com/assets/', 'https://politicpublic.com/static/rebrand/')
(templates / 'index.html').write_text(html)
shutil.copytree(root / 'assets', output / 'app' / 'static' / 'rebrand')
shutil.copyfile(root / 'assets' / 'brand' / 'favicon.svg', output / 'app' / 'static' / 'favicon.svg')
print(f'Created FastAPI integration bundle: {output}')
