import streamlit as st
import streamlit.components.v1 as components
import pathlib
import base64

st.set_page_config(
    page_title="Bombay Asteroids",
    page_icon="assets/graphics/spaceship_full.svg",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Hide Streamlit header/footer/menu
st.markdown("""
<style>
    #MainMenu, header, footer { display: none !important; }
    .block-container { padding: 0 !important; max-width: 100% !important; }
    .stApp { overflow: hidden; }
</style>
""", unsafe_allow_html=True)

base = pathlib.Path(__file__).parent

# Read core files
html = (base / "index.html").read_text(encoding="utf-8")
css  = (base / "style.css").read_text(encoding="utf-8")
js   = (base / "script.js").read_text(encoding="utf-8")

# Convert SVG assets to base64 data URIs
def svg_uri(rel_path: str) -> str:
    data = (base / rel_path).read_bytes()
    b64  = base64.b64encode(data).decode()
    return f"data:image/svg+xml;base64,{b64}"

# Convert audio assets to base64 data URIs
def audio_uri(rel_path: str) -> str:
    data = (base / rel_path).read_bytes()
    b64  = base64.b64encode(data).decode()
    return f"data:audio/mpeg;base64,{b64}"

asset_map = {
    "assets/graphics/spaceship_full.svg":   svg_uri("assets/graphics/spaceship_full.svg"),
    "assets/graphics/asteroid1.svg":        svg_uri("assets/graphics/asteroid1.svg"),
    "assets/graphics/asteroid2.svg":        svg_uri("assets/graphics/asteroid2.svg"),
    "assets/graphics/green_projectile.svg": svg_uri("assets/graphics/green_projectile.svg"),
    "assets/graphics/explosion.svg":        svg_uri("assets/graphics/explosion.svg"),
    "assets/audio/game_table1.mp3":         audio_uri("assets/audio/game_table1.mp3"),
}

# Replace asset paths in JS with inline data URIs
for path, uri in asset_map.items():
    js = js.replace(f"'{path}'", f"'{uri}'")

# Bundle CSS and JS directly into the HTML
bundled = html \
    .replace(
        '<link rel="stylesheet" href="style.css">',
        f"<style>{css}</style>"
    ) \
    .replace(
        '<script src="script.js"></script>',
        f"<script>{js}</script>"
    )

# Also rewrite any asset references that live in the HTML itself
# (favicon link, start-screen logo <img>, etc.) so they resolve inside the iframe
for path, uri in asset_map.items():
    bundled = bundled.replace(f'"{path}"', f'"{uri}"')

components.html(bundled, height=720, scrolling=False)
