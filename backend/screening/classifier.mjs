import { readFileSync } from 'node:fs';
import { tokens } from './normalize.mjs';
import { CATEGORIES } from './categories.mjs';

// Pure-JS text classifier: hashed word and word-pair TF-IDF features, one logistic regression per category (one-vs-rest).
// Weights live in model.json (written by train.mjs). No GPU, no network, no paid service.
export const DIMS = 8192;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % DIMS; };
// Sublinear TF times a learned IDF, L2 normalised so long and short posts compare fairly. `idf` is learned on the training split only.
export function featurize(text, idf) {
  const tf = new Map();
  for (const tok of tokens(text)) { const i = hash(tok); tf.set(i, (tf.get(i) || 0) + 1); }
  const vec = new Map(); let norm = 0;
  for (const [i, c] of tf) { const v = (1 + Math.log(c)) * (idf ? (idf[i] ?? idf.default) : 1); vec.set(i, v); norm += v * v; }
  norm = Math.sqrt(norm) || 1; for (const [i, v] of vec) vec.set(i, v / norm);
  return vec;
}
const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
export function train(examples, { epochs = 80, lr = 0.6, l2 = 1e-4, posWeight = 6, seed = 7 } = {}) {
  const df = new Float64Array(DIMS); for (const e of examples) for (const i of new Set(tokens(e.text).map(hash))) df[i]++;
  const idf = { default: Math.log(1 + examples.length) + 1 }; for (let i = 0; i < DIMS; i++) if (df[i]) idf[i] = Math.log((1 + examples.length) / (1 + df[i])) + 1;
  const data = examples.map(e => ({ vec: featurize(e.text, idf), labels: new Set(e.labels) }));
  let s = seed; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const model = { dims: DIMS, idf: null, categories: {} };
  for (const cat of CATEGORIES) {
    const w = new Float64Array(DIMS); let b = 0;
    for (let ep = 0; ep < epochs; ep++) {
      const order = data.map((_, i) => i).sort(() => rnd() - 0.5), rate = lr / (1 + ep * 0.05);
      for (const idx of order) {
        const { vec, labels } = data[idx], y = labels.has(cat) ? 1 : 0;
        let z = b; for (const [i, v] of vec) z += w[i] * v;
        const err = (sigmoid(z) - y) * (y ? posWeight : 1);
        for (const [i, v] of vec) w[i] -= rate * (err * v + l2 * w[i]);
        b -= rate * err;
      }
    }
    const sparse = {}; for (let i = 0; i < DIMS; i++) if (Math.abs(w[i]) > 0.02) sparse[i] = Math.round(w[i] * 1000) / 1000;
    model.categories[cat] = { bias: Math.round(b * 1000) / 1000, weights: sparse };
  }
  model.idf = Object.fromEntries(Object.entries(idf).map(([k, v]) => [k, Math.round(v * 1000) / 1000]));
  return model;
}
let cached;
export const loadModel = () => cached ??= JSON.parse(readFileSync(new URL('./model.json', import.meta.url), 'utf8'));
export function classify(text, model = loadModel()) {
  const vec = featurize(text, model.idf), out = {};
  for (const cat of CATEGORIES) { const m = model.categories[cat]; let z = m.bias; for (const [i, v] of vec) z += (m.weights[i] || 0) * v; out[cat] = sigmoid(z); }
  return out;
}
