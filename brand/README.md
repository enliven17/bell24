<p align="center"><img src="logo/lockup-color.png" alt="bell24" width="360"></p>

# bell24 brand

The mark is a b24 tile. Its notch is the same cut corner as the site's hero panel, and the coral 24 block fills it: the hours bell24 keeps watching while the market is shut.

| File | Use | Size |
|---|---|---|
| `logo/mark-{color,ink,white}.svg/.png` | the mark alone | 512×512, transparent |
| `logo/lockup-{color,ink,white}.svg/.png` | mark and wordmark | 1200×360, transparent |
| `logo/app-icon.svg/.png` | app and mini app icon | 1024×1024 |
| `banner.png` | README header | 1600×640 at 2× |
| `x-banner.png` | X header | 3000×1000 |
| `x-profile.png` | X and Telegram avatar, circle safe | 800×800 |
| `social/og.png` | link preview | 1200×630 |
| `kit/01..05-*.png` | logo, colour, type, usage, applications | 1600×1000 |

The lockup SVGs keep the wordmark as live Archivo text (loaded from Google Fonts); use the PNGs where fonts can't load.

## Colour and type

| Name | Hex | Use |
|---|---|---|
| Navy | `#002941` | type, panels, dark sections, the mark's body |
| Coral | `#FD6E6E` | actions, payouts, the mark's lip (navy text on coral) |
| Sky | `#B6DFED` | secondary surfaces, chart lines, the clapper on dark |
| Paper | `#F8FCFD` | cards, inputs |
| Canvas | `#E6F3F8` | page ground |
| Base Blue | `#0000FF` | only inside the Base mark |

Inter Tight 700 for display in Title Case, Inter for text, JetBrains Mono for numbers. Archivo Expanded 900 is reserved for the wordmark. All four are SIL OFL.

## Rules

No accent lines, no pill shapes, no status dots, no em dashes. Buttons and tags are squared (6 to 12px radius) and state is written in words.

## Render

Plain HTML in `source/` (open in a browser to edit), exported by headless Edge:

```sh
cd brand
npm install
npm run render
```

`CHROME_PATH` points it at another Chromium.
