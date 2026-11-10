import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import { cpSync, existsSync } from "node:fs";
import basicSsl from "@vitejs/plugin-basic-ssl";

// Mirror the SDK runtime resources from node_modules into public/ so the
// engine, runtime data, and camera UI are self-hosted from this origin.
const SDK_RESOURCES = [
	"dynamsoft-document-scanner/dist",
	"dynamsoft-capture-vision-bundle/dist",
	"dynamsoft-capture-vision-data",
];

for (const pkg of SDK_RESOURCES) {
	if (!existsSync(`public/${pkg}`)) {
		cpSync(`node_modules/${pkg}`, `public/${pkg}`, { recursive: true });
	}
}

export default defineConfig({
	plugins: [basicSsl(), react()],
	// Root config ignores this directory for lint
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
	server: {
		host: true,
		forwardConsole: true,
	},
});
