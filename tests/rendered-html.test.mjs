import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the cauldron exchange calculator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>\+10 가마솥 교환 계산기<\/title>/);
  assert.match(html, /가마솥.*교환 계산기/s);
  for (const name of ["구리 가마솥", "은 가마솥", "금 가마솥", "룬 가마솥"]) assert.match(html, new RegExp(name));
  assert.match(html, /첫 거래 할인/);
  assert.match(html, /판매자 · 노아/);
  assert.match(html, /판매자 · 이화/);
  assert.match(html, /\+5 가마솥/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
