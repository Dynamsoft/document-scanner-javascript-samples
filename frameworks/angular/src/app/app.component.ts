import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { DocumentScanner, type ScanResult } from "@dynamsoft/document-scanner";

// The status line, and the URL of the scanned PDF after a successful scan.
type Shown = { status: string; pdf?: string };

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

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit, OnDestroy {
	shown = signal<Shown>({ status: "Scanning…" });
	private documentScanner = new DocumentScanner({
		license: "YOUR_LICENSE_KEY_HERE", // Replace with your Dynamsoft license key
		// Self-host the engines, which angular.json copies into engine/.
		resources: {
			captureVision: { dcvBundle: "/engine/dynamsoft-capture-vision-bundle/dist" },
			documentViewer: "/engine/dynamsoft-document-viewer/dist/engine",
		},
		output: { format: "pdf" },
	});

	async ngOnInit() {
		this.shown.set(describe(await this.documentScanner.scan()));
	}

	ngOnDestroy() {
		this.documentScanner.dispose();
	}
}
