import { useEffect, useState } from "react";
import { DocumentScanner, type ScanResult } from "@dynamsoft/document-scanner";
import "./App.css";

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

function App() {
	const [result, setResult] = useState<Shown>({ images: [], message: "" });

	useEffect(() => {
		const documentScanner = new DocumentScanner({
			license: "YOUR_LICENSE_KEY_HERE", // Replace with your Dynamsoft license key
			// Self-host the engines, which vite.config.ts copies into public/engine/.
			resources: {
				captureVision: { dcvBundle: "/engine/dynamsoft-capture-vision-bundle/dist" },
				documentViewer: "/engine/dynamsoft-document-viewer/dist/engine",
			},
		});
		// Strict mode mounts the component twice. dispose() cancels the scan of the
		// first mount, and its result must not replace the second one's.
		let mounted = true;
		void documentScanner
			.scan()
			.then(describe)
			.catch((error: unknown) => ({
				images: [],
				message: `Could not show the scan: ${error instanceof Error ? error.message : String(error)}`,
			}))
			.then((shown) => {
				if (mounted) setResult(shown);
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
				{result.images.map((image, index) => (
					<img key={index} className="result-img" src={image} alt={`Scanned page ${index + 1}`} />
				))}
				{result.message && <div className="result-data">{result.message}</div>}
			</div>
		</div>
	);
}

export default App;
