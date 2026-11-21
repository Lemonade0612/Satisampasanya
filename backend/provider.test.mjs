import test from 'node:test';
import assert from 'node:assert/strict';
import { modelReply, modelStream, readSafetyConfig } from './safety/model.mjs';

const down = async () => ({ ok: false, status: 500 });
test('anthropic provider defaults to claude-haiku-5-5', () => {
  const old = process.env.AI_PROVIDER; process.env.AI_PROVIDER = 'anthropic';
  try { assert.equal(readSafetyConfig().model, 'claude-haiku-5-5'); } finally { old === undefined ? delete process.env.AI_PROVIDER : process.env.AI_PROVIDER = old; }
});
test('anthropic without a key falls back to the mock', async () => {
  const text = await modelReply('x', { text: 'Is this safe?' }, { config: { provider: 'anthropic', key: '', model: 'm' } });
  assert.match(text, /official source/);
});
test('anthropic API error falls back to the mock, in Lao for Lao input', async () => {
  const text = await modelReply('x', { text: 'ສະບາຍດີ' }, { fetcher: down, config: { provider: 'anthropic', key: 'k', model: 'm' } });
  assert.match(text, /[຀-໿]/u);
});
test('anthropic success path sends x-api-key and returns text', async () => {
  let headers;
  const fetcher = async (_url, init) => { headers = init.headers; return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'hi' }] }) }; };
  assert.equal(await modelReply('x', { text: 'q' }, { fetcher, config: { provider: 'anthropic', key: 'secret', model: 'm' } }), 'hi');
  assert.equal(headers['x-api-key'], 'secret');
});
test('mock stream emits the canned answer', async () => {
  let got = ''; await modelStream('x', { text: 'q' }, t => { got += t; }, { config: { provider: 'mock', key: '', model: '' } });
  assert.ok(got.length > 10);
});
