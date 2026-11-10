// One DocumentScanner runs each scan, and its result decides which view comes
// next.

import { DocumentScanner } from "@dynamsoft/document-scanner";
import { $, showError } from "./dom.js";
import { showLanding, showPhase, showScanner } from "./view.js";
import { enterResult, leaveResult } from "./results.js";

const homeError = $("home-error");
const scanButtons = [
	$<HTMLButtonElement>("startCameraScan"),
	$<HTMLButtonElement>("desktop-proceed"),
	document.querySelector<HTMLButtonElement>(".btn-rescan")!,
];

// vite.config.ts copies the engines' runtime files into public/engine/. The
// base path is relative, and a worker resolves a relative URL against its own
// script, so make each URL absolute.
const engineUrl = (path: string): string =>
	new URL(`${import.meta.env.BASE_URL}engine/${path}`, document.baseURI).href;

const documentScanner = new DocumentScanner({
	// Set VITE_DYNAMSOFT_LICENSE, for example in .env.local, to use your own key.
	// Without it, the document scanner uses the public trial license. Request a
	// 30-day trial key: https://www.dynamsoft.com/customer/license/trialLicense/?product=mds
	license: import.meta.env.VITE_DYNAMSOFT_LICENSE,
	resources: {
		captureVision: { dcvBundle: engineUrl("dynamsoft-capture-vision-bundle/dist") },
		documentViewer: engineUrl("dynamsoft-document-viewer/dist/engine"),
	},
	output: { format: "pdf" },
});

documentScanner.on("navigate", (navigation) => {
	if (navigation.type === "phase") showPhase(navigation.to);
});

// Load the engines while the user reads the landing page. A failure shows when
// the user starts a scan, because scan() fails the same way.
export function preloadScanner(): void {
	documentScanner.preload().catch((error: unknown) => console.error("Preload failed:", error));
}

// Run one scan. A success shows the result, and the next scan starts empty. A
// cancel returns to the landing page. A failure shows its reason there, and
// keeps the pages, so that the next scan carries on with them.
async function scan(): Promise<void> {
	for (const button of scanButtons) button.disabled = true;
	try {
		showScanner();
		const result = await documentScanner.scan();
		switch (result.status) {
			case "success":
				if (result.output?.format !== "pdf") throw new Error("The scan returned no PDF");
				await enterResult(result.pages, result.output.document);
				documentScanner.reset();
				break;
			case "cancelled":
				showLanding();
				break;
			case "failed": {
				console.error("Scan failed:", result.error);
				showLanding();
				// After a failed load, every later scan fails the same way.
				const retry = result.error.kind === "engineLoad" ? " Reload the page to try again." : "";
				showError(homeError, `Scanning error: ${result.error.message}${retry}`);
				break;
			}
		}
	} finally {
		for (const button of scanButtons) button.disabled = false;
	}
}

// Start a scan from the landing page, with the mobile Continue button or the
// desktop camera button.
export async function startScanFlow(): Promise<void> {
	homeError.replaceChildren();
	await scan();
}

// Drop the result and scan a new set, for the Restart scan button.
export async function restartScan(): Promise<void> {
	leaveResult();
	await scan();
}
