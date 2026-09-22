const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/lib/backend.ts'), 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;

function client(fetch) {
  let now = 0;
  const context = {exports: {}, fetch, URL, Headers, FormData, AbortController, DOMException, TypeError,
    Date: {now: () => now},
    // Advance the retry clock without waiting 90 real seconds in each test.
    setTimeout(fn, ms) {if (ms <= 2000) {now += ms; queueMicrotask(fn);} return 1;},
    clearTimeout() {}};
  vm.runInNewContext(compiled, context);
  return context.exports;
}

test('cold start retries only public health GETs and returns the demo flag', async () => {
  let calls = 0;
  const api = client(async (url, options) => {
    assert.equal(url, 'https://example.com/health');
    assert.equal(options.body, undefined);
    assert.equal(options.cache, 'no-store');
    calls++;
    if (calls === 1) throw new TypeError('Failed to fetch');
    if (calls === 2) return new Response('Starting', {status: 503});
    return Response.json({status: 'ok', demoMode: true});
  });
  assert.equal((await api.connectServer('https://example.com')).demoMode, true);
  assert.equal(calls, 3);
});

test('unavailable host stops retrying and gives actionable feedback', async () => {
  let calls = 0;
  const api = client(async () => {calls++; throw new TypeError('Failed to fetch');});
  await assert.rejects(api.connectServer('https://example.com'), /open the server status link/);
  assert.ok(calls > 1 && calls <= 46);
});

test('invalid startup response and aborted health request are retried', async () => {
  let calls = 0;
  const api = client(async () => {
    calls++;
    if (calls === 1) return new Response('<html>Starting</html>');
    if (calls === 2) throw new DOMException('Aborted', 'AbortError');
    return Response.json({status: 'ok', demoMode: false});
  });
  assert.equal((await api.connectServer('https://example.com')).demoMode, false);
  assert.equal(calls, 3);
});

test('login writes are never automatically retried after a network failure', async () => {
  let calls = 0;
  const api = client(async () => {calls++; throw new TypeError('Failed to fetch');});
  await assert.rejects(api.request('https://example.com', '', '/auth/login', {method: 'POST', body: '{}'}), /Could not reach/);
  assert.equal(calls, 1);
});
