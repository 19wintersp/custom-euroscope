import { For, Show, createSignal, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import "./Page2.css";

import { LibContext } from "../lib/lib";

import Alert from "../component/Alert";
import Button from "../component/Button";
import Eyedrop from "../component/Eyedrop";
import { ArrowRight } from "../component/Icon";
import Throbber from "../component/Throbber";

const SOURCE = [0x05221c, 0x083028, 0x0b4136, 0x105f4f, 0x7d9a94, 0xff8040];
const SWATCH = [
	"Backdrop darkest",
	"Backdrop darker",
	"Backdrop main",
	"Backdrop lighter",
	"Backdrop lightest",
	"Foreground secondary",
];

const THEMES = new Map([
	["EuroScope", [0x05221c, 0x083028, 0x0b4136, 0x105f4f, 0x7d9a94, 0xff8040]],
	["Grey",      [0x000000, 0x131313, 0x262626, 0x4b4b4b, 0x6d6d6d, 0xff8040]],
	["Primer",    [0x0d1117, 0x161b22, 0x21262d, 0x30363d, 0x484f58, 0x388bfd]],
	["Ayu",       [0x0f1419, 0x14191f, 0x191f26, 0x314559, 0x5c6773, 0x39afd7]],
	["Solarised", [0x000000, 0x002b36, 0x073642, 0x586e75, 0x657b83, 0xb58900]],
]);

function createMap(swatch: number[]): Map<number, number> {
	return new Map(swatch.map((c, i) => [SOURCE[i], c]));
}

export default function Page2(
	props: { nextPage: () => any },
) {
	const ctx = useContext(LibContext)!;

	const [loading, setLoading] = createSignal(false);
	const [swatch, setSwatch] = createStore({ swatch: SOURCE });

	const css = (n: number) => "#" + n.toString(16).padStart(6, "0");

	const load = async (swatch: number[]) => {
		setLoading(true);

		if (!import.meta.env.DEV) {
			const map = createMap(swatch);
			ctx()!.exe!.patchColours(map);
			ctx()!.map = swatch.map(css);
		}

		setLoading(false);
		props.nextPage();
	};

	return (
		<>
			<div class="box">
				<p>
					Pick new colours for your scope.
				</p>
			</div>

			<Alert type="info">
				<p>
					You cannot change
				</p>
			</Alert>

			<div class="box spaced">
				<h2>Base theme</h2>

				<select
					onInput={({ currentTarget: s }) => {
						setSwatch({ swatch: THEMES.get(s.value)! });
					}}
				>
					<For each={Array.from(THEMES.keys())}>
						{(theme) => (
							<option>{theme}</option>
						)}
					</For>
				</select>
			</div>

			<div class="box spaced">
				<h2>Customise</h2>

				<For each={swatch.swatch}>
					{(value, i) => (
						<Eyedrop
							label={SWATCH[i()]}
							value={value}
							onChange={(value) => setSwatch("swatch", i(), value)}
						/>
					)}
				</For>
			</div>

			<div class="box spaced">
				<h2>Preview</h2>

				<div
					class="page2-preview"
					style={{
						"--es-bg1": css(swatch.swatch[0]),
						"--es-bg2": css(swatch.swatch[1]),
						"--es-bg3": css(swatch.swatch[2]),
						"--es-bg4": css(swatch.swatch[3]),
						"--es-bg5": css(swatch.swatch[4]),
						"--es-fg1": "white",
						"--es-fg2": css(swatch.swatch[5]),
					}}
				>
					<div>
						<div>
							<div>Primary</div>
						</div>
					</div>

					<div>
						<div>
							<div>Secondary</div>
						</div>
					</div>
				</div>
			</div>

			<div class="box prev-next-row">
				<Button
					onClick={() => !loading() && load(swatch.swatch)}
					primary
				>
					<Show when={!loading()} fallback={<Throbber />}>
						<span>Continue</span>
						<ArrowRight />
					</Show>
				</Button>
			</div>
		</>
	);
}
