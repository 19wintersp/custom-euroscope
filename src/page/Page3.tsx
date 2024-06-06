import {
	Accessor, For, Match, Show, Suspense, Switch, createEffect, createResource,
	createSignal, useContext,
} from "solid-js";
import { createStore } from "solid-js/store";

import "./Page3.css";

import Alert from "../component/Alert";
import Button from "../component/Button";
import { ArrowRight, Download, Dropdown, Reset, Swap, Upload } from "../component/Icon";
import Throbber from "../component/Throbber";

import { ImageInfo, LibContext } from "../lib/lib";
import renderSvg from "../lib/svgRender";

export default function Page3(
	props: { nextPage: () => any },
) {
	const ctx = useContext(LibContext)!;

	const [loading, setLoading] = createSignal(false);
	const [advanced, setAdvanced] = createSignal(false);
	const [theme, setTheme] = createSignal("none");
	const [replacements, setReplacements] = createStore<{ [id: string]: string | null }>({});

	const load = async () => {
		setLoading(true);

		if (!import.meta.env.DEV) {
			for (const [id, url] of Object.entries(replacements)) {
				if (!url) continue;

				const image = new Image();
				await new Promise((res) => {
					image.addEventListener("load", () => res(0));
					image.src = url;
				});

				const bitmap = await createImageBitmap(image);
				const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
				const context = canvas.getContext("2d")!;
				context.drawImage(image, 0, 0);

				const data = context.getImageData(0, 0, canvas.width, canvas.height);
				ctx()!.exe!.patchImage(parseInt(id, 10), data.data);
			}
		}

		setLoading(false);
		props.nextPage();
	};

	return (
		<>
			<div class="box">
				<p>
					I don't know what to write here.
				</p>
			</div>

			<Alert type="info">
				<p>
					An icon set which looks more like the original EuroScope icons is
					coming soon. (maybe)
				</p>
			</Alert>

			<div class="box spaced">
				<h2>Base icon set</h2>

				<select onInput={({ currentTarget: s }) => setTheme(s.value)}>
					<option value="none">None</option>
					<option value="vector">Vector</option>
				</select>
			</div>

			<div class="page3-customise-box">
				<h2>Customise</h2>

				<div classList={{ hide: advanced() }}>
					<Button onClick={() => setAdvanced(true)}>
						<span>Show advanced options</span>
					</Button>
				</div>

				<div
					classList={{
						"page3-customise-col": true,
						hide: !advanced(),
					}}
				>
					<For each={ctx()!.exe!.images}>
						{(image) => (
							<Customise
								image={image}
								theme={theme}
								update={(url) => setReplacements(image.id.toString(), url)}
							/>
						)}
					</For>
				</div>
			</div>

			<div class="box prev-next-row">
				<Button
					onClick={() => !loading() && load()}
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

function Customise(
	props: {
		image: ImageInfo,
		theme: Accessor<string>,
		update: (url: string | null) => void,
	},
) {
	const [expanded, setExpanded] = createSignal(false);
	const [showOld, setShowOld] = createSignal(false);
	const [replacement, setReplacement] = createSignal<string | null>(null);

	const [oldBlob] = createResource<string>(async (_, info) => {
		if (info.value) URL.revokeObjectURL(info.value);

		const ctx = useContext(LibContext)!;

		const array = new Uint8ClampedArray(props.image.width * props.image.height * 4);
		ctx()!.exe!.readImage(props.image.id, array);

		const data = new ImageData(array, props.image.width);
		const bitmap = await createImageBitmap(data);

		const canvas = new OffscreenCanvas(props.image.width, props.image.height);
		const canvasCtx = canvas.getContext("bitmaprenderer");
		canvasCtx?.transferFromImageBitmap(bitmap);

		const blob = await canvas.convertToBlob();
		return URL.createObjectURL(blob);
	});

	const [newBlob] = createResource<string | null, string>(
		props.theme,
		async (theme, info) => {
			if (info.value) {
				console.log("revoke");
				URL.revokeObjectURL(info.value);
			}

			if (theme == "none") {
				return null;
			} else {
				const ctx = useContext(LibContext)!;

				const svg = await fetch(`/bitmap/${theme}/${props.image.id}.svg`);
				if (svg.ok) {
					return await renderSvg(await svg.text(), {
						bg1: ctx()!.map![0]!,
						bg2: ctx()!.map![1]!,
						bg3: ctx()!.map![2]!,
						bg4: ctx()!.map![3]!,
						bg5: ctx()!.map![4]!,
						fg1: "white",
						fg2: ctx()!.map![5]!,
					});
				} else {
					if (svg.status != 404) console.warn("broken request");

					return null;
				}
			}
		},
	);

	createEffect(() => {
		if (replacement()) props.update(replacement());
		else if (newBlob() !== undefined) props.update(newBlob()!);
	});

	let aRef: HTMLAnchorElement | undefined;
	let uploadRef: HTMLInputElement | undefined;

	return (
		<>
			<div class="page3-customise">
				<div class="page3-customise-thumb">
					<img src={oldBlob()} />
				</div>
				<h3>Bitmap {props.image.id}</h3>
				<p>{props.image.width}×{props.image.height} @ {props.image.bpp}bpp</p>

				<div>
					<Button
						onClick={() => setExpanded((e) => !e)}
						style={{
							transform: expanded() ? "scaleY(-1)" : "",
						}}
						compact square
					>
						<Dropdown />
					</Button>
				</div>
			</div>

			<Show when={expanded()}>
				<div class="page3-customise-expanded">
					<div>
						<Suspense fallback={<Throbber />}>
							<img
								src={
									showOld()
										? oldBlob()
										: (replacement() ?? newBlob() ?? oldBlob())
								}
							/>
						</Suspense>
					</div>

					<div>
						<Switch>
							<Match when={showOld()}>
								<Button onClick={() => setShowOld(false)}>
									<Swap />
									<span>Show new</span>
								</Button>

								<Button onClick={() => aRef!.click()}>
									<Download />
									<span>Download</span>
								</Button>

								<a
									ref={aRef}
									class="hide"
									href={oldBlob()}
									download={`${props.image.id}.png`}
								></a>
							</Match>

							<Match when={!showOld()}>
								<Button onClick={() => setShowOld(true)}>
									<Swap />
									<span>Show old</span>
								</Button>

								<Button onClick={() => uploadRef!.click()}>
									<Upload />
									<span>Upload</span>
								</Button>

								<Show when={replacement()}>
									<Button
										onClick={() => setReplacement((url) => {
											if (url) URL.revokeObjectURL(url);
											return null;
										})}
									>
										<Reset />
										<span>Reset</span>
									</Button>
								</Show>

								<input
									ref={uploadRef}
									class="hide"
									type="file"
									accept="image/*"
									onChange={() => {
										if (uploadRef!.files!.length) {
											const file = uploadRef!.files!.item(0)!;
											setReplacement(URL.createObjectURL(file));
										}
									}}
								/>
							</Match>
						</Switch>
					</div>
				</div>
			</Show>
		</>
	);
}
