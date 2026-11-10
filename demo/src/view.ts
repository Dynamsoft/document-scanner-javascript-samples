// View-state — owns body[data-view], body[data-phase], and the info-menu
// dropdown. The mobile/desktop landing swap is pure CSS (see landing.css).

import type { PhaseName } from "@dynamsoft/document-scanner";
import { $ } from "./dom.js";

const homeError = $("home-error");

export function showLanding(): void {
	document.body.dataset.view = "landing";
	delete document.body.dataset.phase;
	homeError.replaceChildren();
}

export function showResult(): void {
	document.body.dataset.view = "result";
	delete document.body.dataset.phase;
}

// The document scanner covers the viewport while a scan runs.
export function showScanner(): void {
	document.body.dataset.view = "scanner";
}

// Name the document scanner's screen (capture, rectify, or edit) in
// body[data-phase], for page CSS such as the deploy build's chat button.
export function showPhase(phase: PhaseName): void {
	document.body.dataset.phase = phase;
}

// ---- Info menu (dropdown in the result header) ----

const infoMenu = $("info-menu");
document.querySelector<HTMLButtonElement>(".info-btn")!.addEventListener("click", () => {
	infoMenu.classList.toggle("open");
});
document.addEventListener("click", (e) => {
	if (!infoMenu.contains(e.target as Node)) infoMenu.classList.remove("open");
});
