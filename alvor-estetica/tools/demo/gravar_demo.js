#!/usr/bin/env node
/*
  Grava o vídeo de demonstração da Alvor (1920 × 1080, 60 quadros/s, MP4/H.264).

  Uso, a partir da pasta alvor-estetica:
    python3 -m http.server 8766 --bind 127.0.0.1 &
    node tools/demo/gravar_demo.js http://127.0.0.1:8766/tools/demo/demo.html demo/alvor-demo.mp4

  Requer Node com Playwright (Chromium) e ffmpeg com libx264.
  O roteiro abaixo comanda o palco tools/demo/demo.html: cartela de abertura,
  tour no computador, experiência no celular e cartela final. Os quadros são
  capturados em tempo real pelo DevTools (screencast) e montados com as
  durações reais, então o ritmo do vídeo é o mesmo da gravação.
*/
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://127.0.0.1:8766/tools/demo/demo.html';
const output = path.resolve(process.argv[3] || 'demo/alvor-demo.mp4');
const FPS = 60;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), 'alvor-quadros-'));
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.demo && window.demo.ready, null, { timeout: 30000 });

  const demo = (fn, ...args) => page.evaluate(([f, a]) => window.demo[f](...a), [fn, args]);

  // Prepara: abertura dos dois sites volta ao estado inicial, para tocar na hora certa.
  await demo('resetHero', 'desk');
  await demo('resetHero', 'phone');
  await page.mouse.move(1430, 400); // fora de qualquer link
  await wait(300);

  // Captura -----------------------------------------------------------------
  const cdp = await context.newCDPSession(page);
  const stamps = [];
  cdp.on('Page.screencastFrame', (f) => {
    const file = path.join(frames, String(stamps.length).padStart(6, '0') + '.jpg');
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    stamps.push(f.metadata.timestamp);
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080 });

  // Helpers do roteiro
  const cursorTo = async (which, selector, ms = 900) => {
    const p = await demo('point', which, selector);
    await demo('cursorTo', p.x, p.y, ms);
    await wait(ms);
    await page.mouse.move(p.x, p.y);
    return p;
  };
  const scrollTo = (which, y, ms) => demo('scroll', which, y, ms);
  const scrollToEl = async (which, selector, offset, ms) => scrollTo(which, await demo('top', which, selector, offset), ms);
  const tap = async (selector) => {
    const p = await demo('point', 'phone', selector);
    await demo('tap', p.x, p.y);
    await wait(180);
    await page.mouse.click(p.x, p.y);
  };

  // 1. Cartela de abertura ---------------------------------------------------
  await demo('cardShow', 'intro');
  await wait(3000);
  await demo('cardHide');
  await wait(250);
  await demo('playHero', 'desk');
  await wait(2200);

  // 2. Computador -------------------------------------------------------------
  await demo('cursorTo', 1250, 760, 0);
  await demo('cursorShow', true);
  await cursorTo('desk', '.hero__actions .btn--solid', 1000);
  await wait(800);
  await cursorTo('desk', '.hero__actions .btn--outline', 700);
  await wait(700);
  await demo('cursorShow', false);
  await page.mouse.move(1430, 400);

  await scrollTo('desk', 470, 1700);
  await wait(1200);
  await scrollToEl('desk', '#clinica', 30, 1800);
  await wait(1600);
  await scrollTo('desk', (await demo('top', 'desk', '#clinica', 30)) + 470, 2000);
  await wait(900);

  await scrollToEl('desk', '#tratamentos', 20, 1800);
  await wait(1100);
  const lastTreatment = await demo('top', 'desk', '#tratamento-ritual', 330);
  await scrollTo('desk', lastTreatment, 8500);
  await wait(500);
  await demo('cursorTo', 1250, 720, 0);
  await demo('cursorShow', true);
  await cursorTo('desk', '#tratamento-ritual .treatment__cta', 900);
  await wait(1000);
  await demo('cursorShow', false);
  await page.mouse.move(1430, 400);

  await scrollToEl('desk', '#espaco', 20, 1800);
  await wait(900);
  await scrollTo('desk', (await demo('top', 'desk', '#espaco', 20)) + 560, 2000);
  await demo('cursorShow', true);
  await cursorTo('desk', '.gallery__item--c .frame', 900);
  await wait(1300);
  await demo('cursorShow', false);
  await page.mouse.move(1430, 400);

  await scrollToEl('desk', '#depoimentos', 0, 1800);
  await wait(2000);

  await scrollToEl('desk', '#duvidas', 40, 1500);
  await demo('cursorShow', true);
  const question = await cursorTo('desk', '.faq__item:first-child summary', 900);
  await demo('click');
  await page.mouse.click(question.x, question.y);
  await wait(2000);
  await demo('cursorShow', false);
  await page.mouse.move(1430, 400);

  await scrollToEl('desk', '#agendar', 0, 1800);
  await demo('cursorShow', true);
  await cursorTo('desk', '.cta__panel .btn--light', 900);
  await wait(1100);
  await demo('cursorShow', false);
  await page.mouse.move(1430, 400);
  await scrollTo('desk', await demo('maxScroll', 'desk'), 1500);
  await wait(1300);

  // 3. Celular ----------------------------------------------------------------
  await demo('step', 1);
  await demo('mobile', true);
  await wait(500);
  await demo('playHero', 'phone');
  await wait(3000);

  await demo('step', 2);
  await wait(400);
  await tap('[data-menu-toggle]');
  await wait(2200);
  await tap('[data-menu-toggle]');
  await wait(900);

  await demo('step', 3);
  await scrollToEl('phone', '.treatments__list', 150, 2000);
  await wait(900);
  await tap('[data-track-next]');
  await wait(1200);
  await tap('[data-track-next]');
  await wait(1400);

  await demo('step', 4);
  await scrollToEl('phone', '#espaco', 30, 2200);
  await wait(800);
  await scrollToEl('phone', '#depoimentos', 0, 2200);
  await wait(900);
  await scrollToEl('phone', '#agendar', 0, 2200);
  await wait(1600);

  // 4. Cartela final ----------------------------------------------------------
  await demo('cardShow', 'outro');
  await wait(4200);

  await cdp.send('Page.stopScreencast');
  await wait(300);
  await browser.close();

  // Montagem ----------------------------------------------------------------
  const list = [];
  for (let i = 0; i < stamps.length; i++) {
    const next = i + 1 < stamps.length ? stamps[i + 1] : stamps[i] + 1 / FPS;
    list.push(`file '${path.join(frames, String(i).padStart(6, '0') + '.jpg')}'`);
    list.push(`duration ${Math.max(1 / FPS, next - stamps[i]).toFixed(5)}`);
  }
  list.push(`file '${path.join(frames, String(stamps.length - 1).padStart(6, '0') + '.jpg')}'`);
  const listFile = path.join(frames, 'lista.txt');
  fs.writeFileSync(listFile, list.join('\n'));

  fs.mkdirSync(path.dirname(output), { recursive: true });
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', `fps=${FPS},scale=1920:1080:flags=lanczos,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation',
    '-movflags', '+faststart',
    output,
  ], { stdio: 'inherit' });

  fs.rmSync(frames, { recursive: true, force: true });
  const secs = stamps[stamps.length - 1] - stamps[0];
  console.log(`${stamps.length} quadros, ${secs.toFixed(1)} s → ${output}`);
})();
