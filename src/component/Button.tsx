import { JSX, JSXElement, splitProps } from "solid-js";

import "./Button.css";

export default function Button(
	props: {
		primary?: boolean,
		compact?: boolean,
		square?: boolean,
		children: JSXElement,
	} & JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) {
	const [local, other] = splitProps(props, ["primary", "compact", "square", "children"]);

	return (
		<button
			classList={{
				button: true,
				primary: local.primary,
				compact: local.compact,
				square: local.square,
			}}
			{...other}
		>
			{local.children}
		</button>
	);
}
