// node lib/img.test.mjs
import assert from "node:assert";
import { sizedHtml } from "./img.ts";

const wp = "https://nadlanistim-cms.bold-move.co.il/wp-content/uploads/2026/a-1024x768.jpg";
const out = sizedHtml(`<p>x</p><img class="wp" src="${wp}" srcset="${wp} 1024w, ${wp.replace("-1024x768", "")} 2400w" sizes="100vw" alt="a">`);
assert.ok(out.includes(`src="/_next/image?url=${encodeURIComponent(wp)}&amp;w=1080&amp;q=75"`), "src goes through the service");
assert.ok(!out.includes(`${wp} 1024w`), "WordPress's own srcset is gone");
assert.strictEqual((out.match(/\ssizes=/g) || []).length, 1, "one sizes attribute");
assert.ok(out.includes('class="wp"') && out.includes('alt="a"'), "other attributes stay");

for (const same of ['<img src="https://example.com/a.jpg" alt="">', '<img src="https://nadlanistim-cms.bold-move.co.il/wp-content/uploads/a.svg">', "<img alt=x>"]) {
  assert.strictEqual(sizedHtml(same), same);
}
console.log("ok");
