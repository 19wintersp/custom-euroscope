import { Show, createSignal, useContext } from "solid-js";

import { LibContext } from "../lib/lib";

import Alert from "../component/Alert";
import Button from "../component/Button";
import { ArrowRight } from "../component/Icon";
import Throbber from "../component/Throbber";

export default function Page1(
	props: { nextPage: () => any },
) {
	const ctx = useContext(LibContext)!;

	const [loading, setLoading] = createSignal(false);

	let file: HTMLInputElement | undefined;

	const load = async () => {
		if (!file!.files?.length) return;

		setLoading(true);

		if (!import.meta.env.DEV) {
			const buffer = await file!.files!.item(0)!.arrayBuffer();

			ctx()!.load(new Uint8Array(buffer));
		}

		setLoading(false);
		props.nextPage();
	};

	return (
		<>
			<div class="box">
				<p>
					This app will patch a EuroScope binary to make customisations. To
					maintain this editing ability across EuroScope versions without
					distributing the EuroScope binary itself, the patching is done
					dynamically on a binary uploaded here.
				</p>
			</div>

			<Alert type="info">
				<p>
					By the magic of WebAssembly, all of the processing happens locally
					within your web browser, and your uploaded files will not leave your
					computer.
				</p>
			</Alert>

			<Alert type="caut">
				<p>
					You must upload an original copy of EuroScope, not a binary that has
					already been patched with this app or any similar tool.
				</p>
			</Alert>

			<Alert type="caut">
				<p>
					Use of this app constitutes violation of the EuroScope EULA.
				</p>
			</Alert>

			<div class="box spaced">
				<h2>Select EuroScope.exe</h2>

				<input type="file" ref={file} accept=".exe" />
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
