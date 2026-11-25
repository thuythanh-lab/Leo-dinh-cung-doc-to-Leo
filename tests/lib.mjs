import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
export const BASE = process.env.BASE || 'http://localhost:5210/';
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
export const SHOTS = new URL('./shots/', import.meta.url); fs.mkdirSync(SHOTS, { recursive: true });
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function open(q = '', o = {}) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 1200000, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--enable-unsafe-swiftshader', '--window-size=1000,600', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage(); await page.setViewport({ width: 960, height: 540, ...(o.viewport || {}) }); const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 5).join('\n'))); page.on('console', (m) => { if (['error', 'warn'].includes(m.type()) && !/GPU stall|AudioContext|WebGL-/.test(m.text())) errors.push(`${m.type()} ${m.text()}`); }); page.on('requestfailed', (r) => errors.push('REQFAIL ' + r.url())); page.on('response', (r) => { if (r.status() >= 400 && !/favicon\.ico/.test(r.url())) errors.push(`HTTP${r.status()} ${r.url()}`); });
  if (o.save) await page.evaluateOnNewDocument((s) => { if (!localStorage.getItem('leo-doc-to-save-v1')) localStorage.setItem('leo-doc-to-save-v1', JSON.stringify(s)); }, o.save);
  await page.goto(BASE + (q ? `?debug&${q}` : '?debug')); await page.waitForFunction(() => window.__game && window.__game.scene.scenes.some((s) => s.sys.isActive() && s.sys.settings.key !== 'Boot'), { timeout: 60000 }); await sleep(800);
  return { browser, page, errors, shot: (n) => page.screenshot({ path: new URL(`${n}.png`, SHOTS).pathname.replace(/^\/([A-Z]:)/, '$1').replaceAll('%20', ' ') }) };
}
