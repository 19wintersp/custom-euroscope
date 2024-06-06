import { ValidComponent, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import "./Icon.css";

function icon<T>(paths: ValidComponent, curried_props: object = {}) {
	return (props: T & { large?: boolean, fill?: string }) => {
		const [local, other] = splitProps(props, ["large", "fill"]);

		return (
			<div class="icon" {...Object.assign(curried_props, other)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width={local.large ? 24 : 16} height={local.large ? 24 : 16}
					fill={local.fill ?? "currentColor"}
				>
					<Dynamic component={paths} />
				</svg>
			</div>
		);
	};
}

function arrow(rotation_degrees: number) {
	return icon(
		() => (
			<path d="M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z" />
		),
		{ style: { transform: `rotate(${rotation_degrees}deg)` } },
	);
}

export const ArrowUp    = arrow(0);
export const ArrowRight = arrow(90);
export const ArrowDown  = arrow(180);
export const ArrowLeft  = arrow(270);

function circled_i(flip?: boolean) {
	return icon(
		() => (
			<path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" />
		),
		{ style: { transform: flip ? `scaleY(-100%)` : "" } },
	);
}

export const Information = circled_i();
export const Warning     = circled_i(true);

export const Download = icon(() => (
	<path d="M3 19H21V21H3V19ZM13 13.1716L19.0711 7.1005L20.4853 8.51472L12 17L3.51472 8.51472L4.92893 7.1005L11 13.1716V2H13V13.1716Z" />
));
export const Upload = icon(() => (
	<path d="M3 19H21V21H3V19ZM13 5.82843V17H11V5.82843L4.92893 11.8995L3.51472 10.4853L12 2L20.4853 10.4853L19.0711 11.8995L13 5.82843Z" />
));

export const Edit = icon(() => (
	<path d="M15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89H6.41421L15.7279 9.57627ZM17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785L17.1421 8.16206ZM7.24264 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L7.24264 20.89Z" />
));

export const Plus = icon(() => (
	<path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z" />
));
export const Minus = icon(() => (
	<path d="M5 11V13H19V11H5Z" />
));

export const Dropdown = icon(() => (
	<path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" />
));

export const Throbber = icon(() => (
	<path d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z" />
));

export const Swap = icon(() => (
	<path d="M16.0503 12.0498L21 16.9996L16.0503 21.9493L14.636 20.5351L17.172 17.9988L4 17.9996V15.9996L17.172 15.9988L14.636 13.464L16.0503 12.0498ZM7.94975 2.0498L9.36396 3.46402L6.828 5.9988L20 5.99955V7.99955L6.828 7.9988L9.36396 10.5351L7.94975 11.9493L3 6.99955L7.94975 2.0498Z" />
));

export const Reset = icon(() => (
	<path d="M18.5374 19.5674C16.7844 21.0831 14.4993 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 14.1361 21.3302 16.1158 20.1892 17.7406L17 12H20C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C14.1502 20 16.1022 19.1517 17.5398 17.7716L18.5374 19.5674Z" />
));
