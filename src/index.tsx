/* @refresh reload */

import { Suspense } from "solid-js";
import { render } from "solid-js/web";

import "./index.css";

import App from "./App";

import Throbber from "./component/Throbber";

render(() => (
	<Suspense
		fallback={
			<div class="solitary">
				<Throbber large />
			</div>
		}
	>
		<App />
	</Suspense>
), document.getElementById("root")!);
