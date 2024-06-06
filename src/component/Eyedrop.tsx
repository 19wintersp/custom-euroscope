import { splitProps } from "solid-js";

import Button from "./Button";
import { Edit } from "./Icon";

function formatColour(c: number) {
	return "#" + c.toString(16).padStart(6, "0");
}

function parseColour(c: string) {
	return parseInt(c.substring(1), 16);
}

function isDark(c: number) {
	const [r, g, b] = [c >> 16, c >> 8, c]
		.map((n) => Math.pow((((n / 255) % 1) + 0.055) / 1.055, 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b < 2 / 3;
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
			<Button
				compact square
				style={{
					"background-color": formatColour(local.value),
					color: isDark(local.value) ? "white" : "currentColor",
				}}
				onClick={() => input!.click()}
			>
				<Edit />
			</Button>

			<span>{local.label}</span>

			<input
				ref={input}
				type="color"
				class="hide"
				value={formatColour(local.value)}
				onInput={(_) => local.onChange(parseColour(input!.value))}
			/>
		</div>
	);
}
