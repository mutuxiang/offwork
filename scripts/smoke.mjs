import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createStaticServer, root } from './serve.mjs';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const chrome = [process.env.CHROME_PATH, process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'), process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'), '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(candidate => fs.existsSync(candidate));
if (!chrome) throw new Error('Set CHROME_PATH to a Chrome/Edge/Chromium executable.');
const server = createStaticServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const offline = path.join(root, 'dist/offwork.html');
const offlineMode = process.env.OFFWORK_SMOKE_OFFLINE === '1';
const entry = offlineMode ? pathToFileURL(offline).href : base;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'offwork-smoke-'));
let socket, browser;
const errors = [], failedAssets = [];
const assert = (ok, message) => { if (!ok) throw new Error(message); };
try {
  browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking', '--disable-component-update', '--no-sandbox', '--mute-audio', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`], { windowsHide: true, stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let n = 0; n < 100 && !fs.existsSync(portFile); n++) await delay(100);
  assert(fs.existsSync(portFile), 'Browser failed to start');
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  let loaded = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const m = JSON.parse(event.data);
    if (m.method === 'Page.loadEventFired') loaded++;
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400 && m.params.response.url.startsWith(base)) failedAssets.push(m.params.response.url);
    const item = pending.get(m.id); if (!item) return;
    clearTimeout(item.timer); pending.delete(m.id);
    m.error ? item.reject(new Error(JSON.stringify(m.error))) : item.resolve(m.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
  const ev = async expression => {
    let r;
    try { r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); }
    catch (error) { throw new Error(`${error.message} while evaluating ${expression.slice(0, 160)}`); }
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const load = async url => {
    const before = loaded;
    await send('Page.navigate', { url });
    for (let n = 0; n < 600 && loaded === before; n++) await delay(100);
    assert(loaded > before, 'Page load did not complete');
    for (let n = 0; n < 100; n++) { if (await ev('typeof jumpTo === "function"')) break; await delay(100); }
    assert(await ev('typeof jumpTo === "function"'), 'Application failed to start');
  };
  await send('Page.enable'); await send('Runtime.enable');
  if (!offlineMode) await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 900, deviceScaleFactor: 1, mobile: false });
  await load(entry); console.log(offlineMode ? 'Checking offline application...' : 'Checking served application...'); await ev('document.fonts.ready');
  assert(await ev('document.querySelector(".welcome-title").textContent.includes("主动设计你的休息时间")'), 'Welcome screen missing');
  for (const page of ['dump', 'sealed', 'closed', 'pod', 'breathe', 'build', 'buildsum', 'planned', 'road', 'combo', 'detail', 'done', 'dash', 'prefs']) {
    await ev(`jumpTo(${JSON.stringify(page)})`);
    assert(await ev('!!document.querySelector("#screen h1,#screen h2,#screen h3")'), `Missing screen: ${page}`);
  }
  console.log('Checking interactive flows...');
  await ev('jumpTo("build")');
  assert(await ev('document.querySelector(".hero-back").textContent.includes("回到呼吸训练")'), 'First-step back label');
  await ev('jumpTo("prefs")');
  assert(await ev('document.querySelectorAll(".settings-pref-grid>.form-card").length===4'), 'Four settings cards missing');
  await ev('document.querySelector("#bed").value="23:30";document.querySelectorAll("[data-pref-input=bed]")[0].click();document.querySelector("[data-action=saveAllPreferences]").click()');
  assert(await ev('state.prefs.bed==="23:15"'), 'Preference shortcut/save failed');
  await ev('jumpTo("dump");set({draft:""})');
  assert(await ev('document.querySelector("#ventExpression").dataset.expression==="calm"'), 'Idle expression should be peaceful');
  assert(await ev('ventSimpleReaction("今天开了一天的会，自己的事情还没做完")==="hug"'), 'Retrospective response should be a hug');
  assert(await ev('ventSimpleReaction("明天记得预约会议室")==="received"'), 'Todo acknowledgment missing');
  await ev('ventTryMic=()=>{ventReal=true};set({draft:"",recording:true,recordStartedAt:Date.now()});ventStop();state.recording=true;ventClear();ventSpawn("今天开了一天的会，自己的事情还没做完。");ventSpawn("明天记得预约会议室。");');
  assert(await ev('document.querySelectorAll(".vent-chat-bubble").length===2'), 'Multiple vent bubbles missing');
  await ev('ventStop();state.recording=false;jumpTo("dash")');
  const top = await ev('document.querySelector(".screen-chrome .dj-header h2").getBoundingClientRect().top');
  await ev('document.querySelector(".screen-content").scrollTop=400');
  assert(await ev('document.querySelector(".screen-chrome .dj-header h2").getBoundingClientRect().top') === top, 'Recovery title should stay pinned');
  for (const kind of ['dinner', 'tv', 'read', 'exercise']) {
    await ev(`openRecommendation(${JSON.stringify(kind)})`);
    assert(await ev('document.querySelector(".feature-placeholder-notice").textContent.includes("功能尚未开发")'), 'Placeholder notice missing');
  }
  await ev('jumpTo("road");set({stage:"commutePodcast"})');
  assert(await ev('!!document.querySelector(".podcast-page-title mark") && !!document.querySelector(".feature-placeholder-notice")'), 'Podcast title/placeholder missing');
  await ev('Promise.all([...document.querySelectorAll("#screen img")].map(image=>image.decode()))');
  assert(errors.length === 0, `Browser errors: ${errors.join(', ')}`);
  assert(!failedAssets.some(url => !url.endsWith('/favicon.ico')), `Missing assets: ${failedAssets.join(', ')}`);
  console.log(`Browser smoke passed (${offlineMode ? 'offline' : 'HTTP'}): routes, assets, settings, venting, planning and recovery.`);
} finally {
  socket?.close();
  if (browser && browser.exitCode === null) await new Promise(resolve => { browser.once('exit', resolve); browser.kill(); setTimeout(resolve, 2000); });
  await new Promise(resolve => server.close(resolve));
  const allowed = path.resolve(os.tmpdir()) + path.sep;
  if (path.resolve(profile).startsWith(allowed) && path.basename(profile).startsWith('offwork-smoke-')) {
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* Browser may briefly retain profile locks on Windows. */ }
  }
}
if (!offlineMode && fs.existsSync(offline)) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [process.argv[1]], { env: { ...process.env, OFFWORK_SMOKE_OFFLINE: '1' }, stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Offline smoke failed (${code})`)));
  });
}
