import type { KnipConfig } from "knip";

export default {
	entry: ["src/**/*.test.*", "src/action/index.ts!"],
	ignore: ["dist/**"],
	ignoreExportsUsedInFile: { interface: true, type: true },
	project: ["!src/tests/**!", "src/**/*.ts!"],
	treatConfigHintsAsErrors: true,
} satisfies KnipConfig;
