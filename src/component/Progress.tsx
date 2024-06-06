import { For, Show, splitProps } from "solid-js";

import "./Progress.css";

export default function Progress(
	props: {
		stages: string[],
		current: number,
	},
) {
	const [local, _] = splitProps(props, ["stages", "current"]);

	return (
		<div class="progress box">
			<For each={local.stages}>
				{(stage, index) => (
					<>
						<div classList={{
							complete: index() < local.current,
							active: index() == local.current,
							"progress-num": true,
						}}>
							<span>{index() + 1}</span>
						</div>

						<Show
							when={index() == local.current}
							fallback={<div class="progress-rule"></div>}
						>
							<div class="progress-label">
								<h1>{stage}</h1>
								<div class="progress-rule"></div>
							</div>
						</Show>
					</>
				)}
			</For>
		</div>
	);
}
