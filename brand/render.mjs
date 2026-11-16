// npm run render → logo/, kit/, social/ and the banners, from the plain HTML in source/ through headless Edge
// (or CHROME_PATH). The SVGs are written straight from source/parts.js, the same geometry the site uses.
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { C, markSvg } from './source/parts.js'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))
for (const d of ['logo', 'kit', 'social']) await mkdir(here(d), { recursive: true })

// SVGs. Lockups keep live text in Archivo (loaded from Google Fonts), so they stay editable.
const lockSvg = (tone) => {
  const word = tone === 'white' ? C.paper : C.ink
  const mark = markSvg(tone).replace('<svg ', '<svg x="0" y="4" width="64" height="64" ')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 72"><style>@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,900');text{font-family:Archivo;font-weight:900;font-stretch:125%;letter-spacing:-2px}</style>${mark}<text x="76" y="56" font-size="58" fill="${word}">bell24</text></svg>`
}
for (const t of ['color', 'ink', 'white']) {
  await writeFile(here(`logo/mark-${t}.svg`), markSvg(t, 512))
  await writeFile(here(`logo/lockup-${t}.svg`), lockSvg(t))
}
await writeFile(
  here('logo/app-icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.ink}"/>${markSvg('paper').replace('<svg ', '<svg x="11.5" y="11.5" width="41" height="41" ')}</svg>`,
)

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname
  const body = await readFile(join(here('source/'), decodeURIComponent(path))).catch(() => null)
  if (!body) return res.writeHead(404).end()
  res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(body)
}).listen(0)
const port = server.address().port

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
})
const jobs = [
  ...['color', 'ink', 'white'].flatMap((t) => [
    [`logo.html?k=mark&t=${t}`, `logo/mark-${t}.png`, 512, 512, 1, true],
    [`logo.html?k=lockup&t=${t}`, `logo/lockup-${t}.png`, 1200, 360, 1, true],
  ]),
  ['logo.html?k=icon', 'logo/app-icon.png', 1024, 1024, 1],
  ['banner.html', 'banner.png', 1600, 640, 2],
  ['banner.html', 'x-banner.png', 1500, 500, 2],
  ['banner.html', 'social/og.png', 1200, 630, 1],
  ['profile.html', 'x-profile.png', 400, 400, 2],
  ...[1, 2, 3, 4, 5].map((s) => [`kit.html?s=${s}`, `kit/0${s}-${['logo', 'colour', 'type', 'usage', 'applications'][s - 1]}.png`, 1600, 1000, 1]),
]
for (const [page, out, w, h, scale, transparent] of jobs) {
  const tab = await browser.newPage()
  await tab.setViewport({ width: w, height: h, deviceScaleFactor: scale })
  await tab.goto(`http://localhost:${port}/${page}`, { waitUntil: 'networkidle0' })
  await tab.evaluate(() => document.fonts.ready)
  await tab.screenshot({ path: here(out), clip: { x: 0, y: 0, width: w, height: h }, omitBackground: !!transparent })
  await tab.close()
  console.log('wrote', out)
}
await browser.close()
server.close()
