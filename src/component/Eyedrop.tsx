import { splitProps } from "solid-js";

import "./Eyedrop.css";

function formatColour(c: number) {
	return "#" + c.toString(16).padStart(6, "0");
}

function parseColour(c: string) {
	return parseInt(c.substring(1), 16);
}

export default function Eyedrop(
	props: {
		label: string,
		value: number,
		onChange: (newValue: number) => void,
	},
) {
	const [local, _other] = splitProps(props, ["label", "value", "onChange"]);

	let input: HTMLInputElement | undefined;

	return (
		<div class="row">
			<input
				ref={input}
				type="color"
				class="eyedrop-input"
				value={formatColour(local.value)}
				onInput={(_) => local.onChange(parseColour(input!.value))}
			/>

			<span>{local.label}</span>
		</div>
	);
}
