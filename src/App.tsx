import { Match, Switch, createResource, createSignal } from "solid-js";

import "./App.css";

import Progress from "./component/Progress";

import { LibContext, loadLib } from "./lib/lib";

import Page1 from "./page/Page1";
import Page2 from "./page/Page2";
import Page3 from "./page/Page3";
import Page4 from "./page/Page4";

export default function App() {
	const [lib] = createResource((_) => loadLib());
	const [current, setCurrent] = createSignal(0);

	const nextPage = () => setCurrent(current() + 1);

	return (
		<>
			{/* silly hack: Suspense won't recognise lib otherwise */}
			<span class="hide">{lib()?.load.name}</span>

			<LibContext.Provider value={lib}>
				<Progress
					stages={[
						"Upload EuroScope executable",
						"Update theme colours",
						"Update embedded bitmaps",
						"Download new executable",
					]}
					current={current()}
				/>

				<Switch>
					<Match when={current() == 0}>
						<Page1 nextPage={nextPage} />
					</Match>

					<Match when={current() == 1}>
						<Page2 nextPage={nextPage} />
					</Match>

					<Match when={current() == 2}>
						<Page3 nextPage={nextPage} />
					</Match>

					<Match when={current() == 3}>
						<Page4 />
					</Match>
				</Switch>
			</LibContext.Provider>
		</>
	);
}
