// View-state — owns body[data-view] and the info-menu dropdown. The
// mobile/desktop landing swap is pure CSS (see landing.css).

import { $ } from "./dom.js";

const homeError = $("home-error");

export function showLanding(): void {
	document.body.dataset.view = "landing";
	homeError.replaceChildren();
}

export function showResult(): void {
	document.body.dataset.view = "result";
}

// The document scanner covers the viewport while a scan runs.
export function showScanner(): void {
	document.body.dataset.view = "scanner";
}

// ---- Info menu (dropdown in the result header) ----

const infoMenu = $("info-menu");
document.querySelector<HTMLButtonElement>(".info-btn")!.addEventListener("click", () => {
	infoMenu.classList.toggle("open");
});
document.addEventListener("click", (e) => {
	if (!infoMenu.contains(e.target as Node)) infoMenu.classList.remove("open");
});
