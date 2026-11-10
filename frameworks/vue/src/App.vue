<template>
	<div class="mds-hello-world-page">
		<div class="mds-title">
			<h2 class="mds-title-text">Hello World for Vue</h2>
		</div>
		<div class="mds-result-container">
			<img
				v-for="(image, index) in result.images"
				:key="index"
				class="result-img"
				:src="image"
				:alt="`Scanned page ${index + 1}`"
			/>
			<div v-if="result.message" class="result-data">{{ result.message }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { DocumentScanner, type ScanResult } from "@dynamsoft/document-scanner";

// The page images to show, or the reason there are none.
type Shown = { images: string[]; message: string };

const result = ref<Shown>({ images: [], message: "" });

const documentScanner = new DocumentScanner({
	license: "YOUR_LICENSE_KEY_HERE", // Replace with your Dynamsoft license key
	// Self-host the engines, which vite.config.ts copies into public/engine/.
	resources: {
		captureVision: { dcvBundle: "/engine/dynamsoft-capture-vision-bundle/dist" },
		documentViewer: "/engine/dynamsoft-document-viewer/dist/engine",
	},
});

// Draw each scanned page, or say why there is none.
async function describe(scan: ScanResult): Promise<Shown> {
	switch (scan.status) {
		case "success": {
			const canvases = await Promise.all(scan.pages.map((page) => page.processed.toCanvas()));
			return { images: canvases.map((canvas) => canvas.toDataURL("image/png")), message: "" };
		}
		case "cancelled":
			return { images: [], message: "No document scanned. Reload the page to try again." };
		case "failed":
			return { images: [], message: `The scan failed: ${scan.error.message}` };
	}
}

onMounted(async () => {
	try {
		result.value = await describe(await documentScanner.scan());
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		result.value = { images: [], message: `Could not show the scan: ${message}` };
	}
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

.mds-result-container .result-img {
	width: 100%;
}

.mds-result-container .result-data {
	white-space: pre-line;
	padding-bottom: 20px;
}
</style>
