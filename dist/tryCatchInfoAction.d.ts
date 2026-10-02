export declare function tryCatchInfoAction<T>(label: string, action: () => Promise<T>): Promise<T | undefined>;
export declare function tryCatchSetFailedAction<T>(label: string, action: () => Promise<T>): Promise<T | undefined>;
