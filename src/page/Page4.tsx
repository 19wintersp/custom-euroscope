import { useContext } from "solid-js";

import { LibContext } from "../lib/lib";

import Alert from "../component/Alert";
import Button from "../component/Button";
import { Download } from "../component/Icon";

export default function Page4() {
	const ctx = useContext(LibContext)!;

	const buffer = ctx()!.buffer!;
	ctx()!.exe!.finish(buffer);
	const blob = URL.createObjectURL(new Blob([buffer]));

	let a: HTMLAnchorElement | undefined;

	return (
		<>
			<div class="box">
				<p>
					Once downloaded, simply replace your current EuroScope.exe file with
					the new one.
				</p>
			</div>

			<Alert type="caut">
				<p>
					In case of any potential issue, it is a good idea to keep a backup of
					the original EuroScope executable under a different name, so that it
					can be restored.
				</p>
			</Alert>

			<Alert type="info">
				<p>
					If you wish to share your modified EuroScope with others, you can
					either directly share the new binary or create a binary diff against
					the original.
				</p>
			</Alert>

			<div class="box prev-next-row">
				<Button
					onClick={() => a!.click()}
					primary
				>
					<Download />
					<span>Download</span>
				</Button>

				<a ref={a} class="hide" href={blob} download="EuroScope.exe"></a>
			</div>
		</>
	);
}
