// One batched inspection round for the booklet redesign: desktop + mobile, ar + en, light + dark, every chat state.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = ".impeccable/review";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const shot = (page, name, fullPage = false) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
const settle = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
};
const ask = async (page, text, nth) => {
  await page.fill("#message", text);
  await page.locator("form button[type=submit]").click();
  await page.locator("svg.tick").nth(nth).waitFor({ timeout: 30_000 });
  await page.waitForTimeout(700);
};
const dark = async (page, on) => {
  await page.emulateMedia({ colorScheme: on ? "dark" : "light" });
  await page.waitForTimeout(900);
};

// Desktop, Arabic: cover, sign-up, every chat state.
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
await desk.addCookies([{ name: "NEXT_LOCALE", value: "ar", url: BASE }]);
let p = await desk.newPage();
await p.goto(`${BASE}/auth/sign-up`);
await settle(p);
await shot(p, "signup-ar-light-desktop");
await dark(p, true);
await shot(p, "signup-ar-dark-desktop");
await dark(p, false);

await p.locator("#university_id").selectOption("ksu");
await p.locator("#major_id").selectOption({ index: 1 });
await p.fill("#email", `review+${Date.now()}@example.org`);
await p.fill("#password", "review-pass-1");
await p.fill("#repeat", "review-pass-1");
await p.locator("form button[type=submit]").click();
await p.waitForURL(/\/chat$/);
await settle(p);
await shot(p, "chat-empty-ar-light-desktop");
await dark(p, true);
await shot(p, "chat-empty-ar-dark-desktop");
await dark(p, false);

await p.fill("#message", "ما هي الأفكار الأساسية التي يجب أن أتقنها أولًا؟");
await p.keyboard.press("Enter");
await p.waitForTimeout(1100);
await shot(p, "chat-writing-ar-light-desktop");
await p.locator("svg.tick").first().waitFor({ timeout: 30_000 });
await ask(p, "ما هو تخصصي؟", 1);
await shot(p, "desktop");
await dark(p, true);
await shot(p, "chat-ar-dark-desktop");
await dark(p, false);

await p.fill("#message", "AUTHFAIL test");
await p.keyboard.press("Enter");
await p.locator("main [role=alert]").waitFor({ timeout: 30_000 });
await p.waitForTimeout(300);
await shot(p, "chat-error-ar-light-desktop");
const state = await desk.storageState();

// Desktop, English.
const en = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light", storageState: state });
await en.addCookies([{ name: "NEXT_LOCALE", value: "en", url: BASE }]);
p = await en.newPage();
await p.goto(`${BASE}/chat`);
await settle(p);
await shot(p, "chat-empty-en-light-desktop");
await ask(p, "What should I master first?", 0);
await shot(p, "chat-en-light-desktop");
await dark(p, true);
await shot(p, "chat-en-dark-desktop");

// Mobile, Arabic.
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "light", storageState: state });
await mob.addCookies([{ name: "NEXT_LOCALE", value: "ar", url: BASE }]);
p = await mob.newPage();
await p.goto(`${BASE}/chat`);
await settle(p);
await shot(p, "chat-empty-ar-mobile");
await ask(p, "ما هي الأفكار الأساسية التي يجب أن أتقنها أولًا؟", 0);
await shot(p, "mobile");
await p.setViewportSize({ width: 360, height: 780 });
await p.waitForTimeout(300);
console.log("chat 360 horizontal overflow:", await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await shot(p, "chat-ar-360");

// Logged-out covers.
const anon = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, colorScheme: "light" });
await anon.addCookies([{ name: "NEXT_LOCALE", value: "ar", url: BASE }]);
p = await anon.newPage();
await p.goto(`${BASE}/auth/sign-up`);
await settle(p);
await shot(p, "signup-ar-mobile", true);
await p.setViewportSize({ width: 360, height: 780 });
console.log("signup 360 horizontal overflow:", await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));

const anonDesk = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await anonDesk.addCookies([{ name: "NEXT_LOCALE", value: "en", url: BASE }]);
p = await anonDesk.newPage();
await p.goto(`${BASE}/auth/login`);
await settle(p);
await shot(p, "login-en-dark-desktop");

await browser.close();
console.log("done");
