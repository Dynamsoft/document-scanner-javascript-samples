import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";

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

// Cross-origin isolation lets DCV use its multi-threaded (pthread) WASM. This
// sample loads nothing from another origin, so "require-corp" works, also in
// Safari.
const isolation = {
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
	plugins: [basicSsl(), vue()],
	// Root config ignores this directory for lint
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
	server: {
		host: true,
		forwardConsole: true,
		headers: isolation,
	},
	preview: {
		headers: isolation,
	},
});
