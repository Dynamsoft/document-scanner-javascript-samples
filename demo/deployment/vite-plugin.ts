// Adds the parts that only the live demo carries: Google Tag Manager, the
// Comm100 chat, and the IIS web.config. Only `vp build --mode deploy` runs it.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv, type HtmlTagDescriptor, type Plugin } from "vite-plus";

const KEYS = ["GTM_ID", "COMM100_SITE_ID", "COMM100_CODE_PLAN", "VITE_DYNAMSOFT_LICENSE"] as const;

type Keys = Record<(typeof KEYS)[number], string>;

// Vite's own sources: the environment first, then the .env files of the mode.
function readKeys(mode: string, envDir: string | false): Keys {
	const env = loadEnv(mode, envDir, "");
	const missing = KEYS.filter((key) => !env[key]);
	if (missing.length > 0) {
		throw new Error(`The deploy build needs these environment variables: ${missing.join(", ")}`);
	}
	return Object.fromEntries(KEYS.map((key) => [key, env[key]])) as Keys;
}

// Deferred, and skipped under WebDriver so that automated runs send no analytics.
function gtmScript(id: string): string {
	return `if (!navigator.webdriver) {
	setTimeout(() => {
		(function (w, d, s, l, i) {
			w[l] = w[l] || [];
			w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
			var f = d.getElementsByTagName(s)[0],
				j = d.createElement(s),
				dl = l != "dataLayer" ? "&l=" + l : "";
			j.async = true;
			j.src = "//www.googletagmanager.com/gtm.js?id=" + i + dl;
			f.parentNode.insertBefore(j, f);
		})(window, document, "script", "dataLayer", ${JSON.stringify(id)});
	}, 0);
}`;
}

// The install snippet from the Comm100 admin panel.
function comm100Script(siteId: string, codePlan: string): string {
	return `var Comm100API = Comm100API || {};
(function (t) {
	function e(e) {
		var a = document.createElement("script"),
			c = document.getElementsByTagName("script")[0];
		a.type = "text/javascript";
		a.async = true;
		a.src = e + t.site_id;
		c.parentNode.insertBefore(a, c);
	}
	t.chat_buttons = t.chat_buttons || [];
	t.chat_buttons.push({ code_plan: ${JSON.stringify(codePlan)}, div_id: ${JSON.stringify(`comm100-button-${codePlan}`)} });
	t.site_id = ${JSON.stringify(siteId)};
	t.main_code_plan = ${JSON.stringify(codePlan)};
	e("https://vue.comm100.com/livechat.ashx?siteId=");
	setTimeout(function () {
		if (!t.loaded) e("https://standby.comm100vue.com/livechat.ashx?siteId=");
	}, 5000);
})(Comm100API || {});`;
}

function tags(keys: Keys): HtmlTagDescriptor[] {
	const gtmFrame = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(keys.GTM_ID)}`;
	return [
		{ tag: "link", attrs: { rel: "stylesheet", href: "./deployment/chat.css" }, injectTo: "head" },
		{ tag: "script", children: gtmScript(keys.GTM_ID), injectTo: "head" },
		{
			tag: "noscript",
			children: [
				{
					tag: "iframe",
					attrs: {
						src: gtmFrame,
						height: "0",
						width: "0",
						style: "display: none; visibility: hidden",
					},
				},
			],
			injectTo: "body-prepend",
		},
		{
			tag: "button",
			attrs: { type: "button", class: "livechat-btn" },
			children: "Chat with us",
			injectTo: "body",
		},
		{ tag: "div", attrs: { id: `comm100-button-${keys.COMM100_CODE_PLAN}` }, injectTo: "body" },
		{
			tag: "script",
			children: comm100Script(keys.COMM100_SITE_ID, keys.COMM100_CODE_PLAN),
			injectTo: "body",
		},
		{ tag: "script", attrs: { type: "module", src: "./deployment/chat.ts" }, injectTo: "body" },
	];
}

export function deployment(): Plugin {
	let keys: Keys;
	return {
		name: "demo-deployment",
		apply: (_, { command, mode }) => command === "build" && mode === "deploy",
		configResolved(config) {
			keys = readKeys(config.mode, config.envDir);
		},
		// "pre" lets Vite bundle the chat stylesheet and script like the page's own.
		transformIndexHtml: { order: "pre", handler: () => tags(keys) },
		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "web.config",
				source: readFileSync(resolve(import.meta.dirname, "web.config")),
			});
		},
	};
}
