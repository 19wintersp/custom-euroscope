export type Theme = {
	bg1: string,
	bg2: string,
	bg3: string,
	bg4: string,
	bg5: string,
	fg1: string,
	fg2: string,
};

const NS_THEME = "http://19wintersp.github.io/custom-euroscope/theme";

// SPAA and downscaling methods appear much worse than just rendering at-res.
// more complex !== better
export default async function renderSvg(
	src: string,
	theme: Theme,
): Promise<string | null> {
	const doc = (new DOMParser).parseFromString(src, "text/xml");
	const svg = doc.documentElement;

	if (doc.querySelector("parsererror")) {
		console.error("svg parser error");
		return null;
	}

	const width = parseInt(svg.getAttribute("width")!, 10);
	const height = parseInt(svg.getAttribute("height")!, 10);

	if (svg.getAttribute("viewBox") != `0 0 ${width} ${height}`) {
		console.warn("bad viewbox");
	}

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext("2d")!;

	for (const path of Array.from(svg.children)) {
		if (path.localName != "path") continue;

		ctx.fillStyle = path.hasAttributeNS(NS_THEME, "fill")
			? theme[path.getAttributeNS(NS_THEME, "fill")! as keyof Theme]
			: path.getAttribute("fill")!;

		ctx.globalAlpha = path.hasAttribute("opacity")
			? parseFloat(path.getAttribute("opacity")!)
			: 1.0;

		ctx.fill(
			new Path2D(path.getAttribute("d")!),
			(path.getAttribute("fill-rule") ?? undefined) as CanvasFillRule,
		);
	}

	return URL.createObjectURL(await canvas.convertToBlob());
}
