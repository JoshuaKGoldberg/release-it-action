import { $ } from "execa";

import { cancellation } from "./cancellation.js";

export const $$ = $({ stdio: "inherit" });

export const $$captured = $({
	all: true,
	cancelSignal: cancellation.signal,
	stderr: ["inherit", "pipe"],
	stdin: "inherit",
	stdout: ["inherit", "pipe"],
});
