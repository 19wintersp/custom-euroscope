import "./Throbber.css";

import { Throbber as ThrobberIcon } from "./Icon";

export default function Throbber(props: { large?: boolean }) {
	return (
		<div class="throbber">
			<ThrobberIcon {...props} />
		</div>
	);
}
