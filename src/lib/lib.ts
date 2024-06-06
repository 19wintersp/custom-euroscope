import { createContext } from "solid-js";

// @ts-ignore
import lib from "../../lib/Cargo.toml";

export type Lib = {
	Exe: {
		parse: (data: Uint8Array) => Exe,
	},
};

export type Exe = {
	images: ImageInfo[],
	readImage: (id: number, pixels: Uint8ClampedArray) => void,
	patchColours: (map: ColourMap) => void,
	patchImage: (id: number, image: Uint8ClampedArray) => void,
	finish: (buffer: Uint8Array) => void,
};

export type ImageInfo = {
	id: number,
	width: number,
	height: number,
	bpp: number,
};

export type ColourMap = Map<number, number>;

// none of this should be reactive, so this incredibly bad solution "works"
export type LibWrapper = {
	load: (data: Uint8Array) => void,
	buffer?: Uint8Array,
	exe?: Exe,
	map?: string[],
};

export const LibContext = createContext<() => LibWrapper | undefined>();

export async function loadLib(): Promise<LibWrapper> {
	const [{ Exe }, _] = await Promise.all([
		lib(),
		new Promise((res) => setTimeout(() => res(null), 1000)),
	]);

	console.info("wasm loaded");

	const wrapper: LibWrapper = {
		load(data) {
			this.buffer = data;
			this.exe = Exe.parse(data);
		},
	};

	return wrapper;
}
