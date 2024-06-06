import { JSX, JSXElement, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import "./Alert.css";
import { Information, Warning } from "./Icon";

export default function Alert(
	props: {
		type: "info" | "caut" | "warn",
		children: JSXElement,
	} & JSX.HTMLAttributes<HTMLDivElement>,
) {
	const [local, other] = splitProps(props, ["type", "children"]);

	return (
		<div
			classList={{
				alert: true,
				info: local.type == "info",
				caut: local.type == "caut",
				warn: local.type == "warn",
			}}
			{...other}
		>
			<div class="alert-header">
				<Dynamic component={local.type == "info" ? Information : Warning} large />

				<h2>{
					{
						info: "Information",
						caut: "Caution",
						warn: "Warning",
					}[local.type]
				}</h2>
			</div>

			{local.children}
		</div>
	);
}
