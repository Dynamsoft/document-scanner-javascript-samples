import { defineConfig } from "vite-plus";
import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { deployment } from "./deployment/vite-plugin.ts";

// Copy the engines' runtime files from node_modules into public/engine/, so that
// this origin serves them. The loop replaces a copy of another version.
const version = (dir: string): unknown =>
	JSON.parse(readFileSync(`${dir}/package.json`, "utf8")).version;

for (const engine of ["dynamsoft-capture-vision-bundle", "dynamsoft-document-viewer"]) {
	const source = resolve(import.meta.dirname, "node_modules", engine);
	const target = resolve(import.meta.dirname, "public/engine", engine);
	if (existsSync(`${target}/package.json`) && version(source) === version(target)) continue;
	rmSync(target, { recursive: true, force: true });
	cpSync(`${source}/dist`, `${target}/dist`, { recursive: true });
	cpSync(`${source}/package.json`, `${target}/package.json`);
}

// Cross-origin isolation lets DCV use its multi-threaded (pthread) WASM.
// "credentialless", unlike "require-corp", also loads cross-origin scripts that
// send no CORP header, such as the deploy build's GTM and Comm100. Safari does
// not support it, so Safari stays without isolation. deployment/web.config
// sends the same headers.
const isolation = {
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Embedder-Policy": "credentialless",
};

export default defineConfig({
	// Root config ignores this directory for lint
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
	// Emit relative paths in index.html so the demo also works under a
	// non-root deploy base like /document-scanner/.
	base: "./",
	plugins: [basicSsl(), deployment()],
	server: {
		host: true,
		headers: isolation,
	},
	preview: {
		headers: isolation,
	},
});
