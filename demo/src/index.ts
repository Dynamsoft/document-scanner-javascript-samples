// Entry point — wires DOM events to the flow modules. The supporting modules
// attach their own listeners at import time.

import { $ } from "./dom.js";
import { preloadScanner, restartScan, startScanFlow } from "./scanner.js";
import { downloadPdf } from "./results.js";

$<HTMLButtonElement>("startCameraScan").addEventListener("click", startScanFlow);
$<HTMLButtonElement>("desktop-proceed").addEventListener("click", startScanFlow);

document.querySelector<HTMLButtonElement>(".btn-rescan")!.addEventListener("click", restartScan);
document.querySelector<HTMLButtonElement>(".btn-download")!.addEventListener("click", downloadPdf);

// Load the engines in the background, so that the first scan starts at once.
preloadScanner();
