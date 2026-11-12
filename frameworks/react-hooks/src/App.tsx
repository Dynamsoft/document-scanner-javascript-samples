import { useEffect, useState } from "react";
import { DocumentScanner, type ScanResult } from "@dynamsoft/document-scanner";
import "./App.css";

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

function App() {
	const [shown, setShown] = useState<Shown>({ status: "Scanning…" });

	useEffect(() => {
		const documentScanner = new DocumentScanner({
			license: "YOUR_LICENSE_KEY_HERE", // Replace with your Dynamsoft license key
			// Self-host the engines, which vite.config.ts copies into public/engine/.
			resources: {
				captureVision: { dcvBundle: "/engine/dynamsoft-capture-vision-bundle/dist" },
				documentViewer: "/engine/dynamsoft-document-viewer/dist/engine",
			},
			output: { format: "pdf" },
		});
		// Strict mode mounts the component twice. dispose() cancels the scan of the
		// first mount, and its result must not replace the second one's.
		let mounted = true;
		void documentScanner.scan().then((result) => {
			if (mounted) setShown(describe(result));
		});
		return () => {
			mounted = false;
			documentScanner.dispose();
		};
	}, []);

	return (
		<div className="mds-hello-world-page">
			<div className="mds-title">
				<h2 className="mds-title-text">Hello World for React</h2>
			</div>
			<div className="mds-result-container">
				<p className="result-data">{shown.status}</p>
				{shown.pdf && (
					<a href={shown.pdf} download="scan.pdf">
						Download the PDF
					</a>
				)}
			</div>
		</div>
	);
}

export default App;
