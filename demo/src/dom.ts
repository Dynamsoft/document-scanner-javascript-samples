export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
	const el = document.getElementById(id);
	if (!el) throw new Error(`Missing #${id}`);
	return el as T;
};

// Replace the content of `container` with an error notice.
export function showError(container: HTMLElement, text: string): void {
	const notice = document.createElement("div");
	notice.className = "error-message";
	notice.textContent = text;
	container.replaceChildren(notice);
}
