import puppeteer from 'puppeteer-core'
const [,, out, w = '1440', h = '900', ...paths] = process.argv
const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
const p = await b.newPage()
p.on('pageerror', (e) => console.log('PAGEERR', e.message))
p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
await p.setViewport({ width: +w, height: +h })
for (const spec of paths) {
  const [path, ...ys] = spec.split('@')
  await p.goto('http://localhost:5173' + path, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 2200))
  const total = await p.evaluate(() => document.documentElement.scrollHeight)
  const list = ys.length ? ys.map(Number) : [0]
  for (const y of list) {
    await p.evaluate((y) => window.scrollTo(0, y), y)
    await new Promise((r) => setTimeout(r, 1600))
    const name = `${out}/${path.replace(/\//g, '_') || 'home'}-${w}-${y}.png`
    await p.screenshot({ path: name })
    console.log(name, 'total', total)
  }
}
await b.close()
