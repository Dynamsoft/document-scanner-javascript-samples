// Result view — renders the scanned pages into the scrollable inset, and owns
// the blob URLs of the pages and the PDF.

import type { ScannedPages } from "@dynamsoft/document-scanner";
import { $, showError } from "./dom.js";
import { showResult } from "./view.js";

const resultError = $("result-error");
const insetPages = $("inset-pages");
const downloadButton = document.querySelector<HTMLButtonElement>(".btn-download")!;

let pdfUrl: string | null = null;
let pageUrls: string[] = [];

// The scan encodes the PDF before it ends, so a download reuses one blob.
export async function enterResult(pages: ScannedPages, pdf: Blob): Promise<void> {
	resultError.replaceChildren();
	insetPages.replaceChildren();
	pdfUrl = URL.createObjectURL(pdf);
	downloadButton.disabled = false;
	showResult();
	try {
		// The processed image includes the edits of the edit screen, so the inset
		// matches the PDF.
		const blobs = await Promise.all(pages.map((page) => page.processed.toBlob()));
		pageUrls = blobs.map((blob) => URL.createObjectURL(blob));
		for (const [index, url] of pageUrls.entries()) {
			const img = document.createElement("img");
			img.src = url;
			img.alt = `Scanned page ${index + 1}`;
			insetPages.appendChild(img);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Result error:", error);
		showError(resultError, `Failed to show the pages: ${message}`);
	}
}

// Revokes the blob URLs and clears the view; called before every exit.
export function leaveResult(): void {
	if (pdfUrl) URL.revokeObjectURL(pdfUrl);
	pdfUrl = null;
	for (const url of pageUrls) URL.revokeObjectURL(url);
	pageUrls = [];
	insetPages.replaceChildren();
	downloadButton.disabled = true;
	resultError.replaceChildren();
}

export function downloadPdf(): void {
	if (!pdfUrl) return;
	const link = document.createElement("a");
	link.href = pdfUrl;
	link.download = `document-${Date.now()}.pdf`;
	link.click();
}
