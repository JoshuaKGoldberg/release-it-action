import { $ } from "execa";

export const $$ = $({ stdio: "inherit" });

export const $$captured = $({
	all: true,
	stderr: ["inherit", "pipe"],
	stdin: "inherit",
	stdout: ["inherit", "pipe"],
});

export const $quiet = $({ reject: false });
