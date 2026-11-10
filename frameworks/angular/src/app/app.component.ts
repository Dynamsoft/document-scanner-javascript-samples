import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { DocumentScanner, type ScanResult } from "@dynamsoft/document-scanner";

// The page images to show, or the reason there are none.
type Shown = { images: string[]; message: string };

// Draw each scanned page, or say why there is none.
async function describe(result: ScanResult): Promise<Shown> {
	switch (result.status) {
		case "success": {
			const canvases = await Promise.all(result.pages.map((page) => page.processed.toCanvas()));
			return { images: canvases.map((canvas) => canvas.toDataURL("image/png")), message: "" };
		}
		case "cancelled":
			return { images: [], message: "No document scanned. Reload the page to try again." };
		case "failed":
			return { images: [], message: `The scan failed: ${result.error.message}` };
	}
}

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit, OnDestroy {
	result = signal<Shown>({ images: [], message: "" });
	private documentScanner = new DocumentScanner({
		license: "YOUR_LICENSE_KEY_HERE", // Replace with your Dynamsoft license key
		// Self-host the engines, which angular.json copies into engine/.
		resources: {
			captureVision: { dcvBundle: "/engine/dynamsoft-capture-vision-bundle/dist" },
			documentViewer: "/engine/dynamsoft-document-viewer/dist/engine",
		},
	});

	async ngOnInit() {
		try {
			this.result.set(await describe(await this.documentScanner.scan()));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.result.set({ images: [], message: `Could not show the scan: ${message}` });
		}
	}

	ngOnDestroy() {
		this.documentScanner.dispose();
	}
}
