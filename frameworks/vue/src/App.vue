<template>
	<div class="mds-hello-world-page">
		<div class="mds-title">
			<h2 class="mds-title-text">Hello World for Vue</h2>
		</div>
		<div class="mds-result-container">
			<p class="result-data">{{ shown.status }}</p>
			<a v-if="shown.pdf" :href="shown.pdf" download="scan.pdf">Download the PDF</a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { DocumentScanner, type ScanResult } from "@dynamsoft/document-scanner";

// The status line, and the URL of the scanned PDF after a successful scan.
type Shown = { status: string; pdf?: string };

const shown = ref<Shown>({ status: "Scanning…" });

const documentScanner = new DocumentScanner({
	license: "YOUR_LICENSE_KEY_HERE", // Replace with your Dynamsoft license key
	// Self-host the engines, which vite.config.ts copies into public/engine/.
	resources: {
		captureVision: { dcvBundle: "/engine/dynamsoft-capture-vision-bundle/dist" },
		documentViewer: "/engine/dynamsoft-document-viewer/dist/engine",
	},
	output: { format: "pdf" },
});

// Say how the scan ended, and link the PDF when there is one.
function describe(result: ScanResult): Shown {
	switch (result.status) {
		case "success":
			return {
				status: `Scanned ${result.pages.length} page(s).`,
				pdf:
					result.output?.format === "pdf" ? URL.createObjectURL(result.output.document) : undefined,
			};
		case "failed":
			return { status: `The scan failed (${result.error.kind}): ${result.error.message}` };
		case "cancelled":
			return { status: "The scan was cancelled." };
	}
}

onMounted(async () => {
	shown.value = describe(await documentScanner.scan());
});

onBeforeUnmount(() => {
	documentScanner.dispose();
});
</script>

<style>
body {
	margin: 0;
	font-family: system-ui, sans-serif;
}

.mds-hello-world-page {
	width: 100%;
	height: 100%;
	text-align: center;
}

.mds-title {
	height: 90px;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20px 0;
}

.mds-result-container {
	overflow-y: auto;
	height: calc(100dvh - 90px - 40px);
	width: 100%;
}

.mds-result-container .result-data {
	white-space: pre-line;
}
</style>
