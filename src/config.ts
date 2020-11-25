import { workspace } from "vscode";
import { MINUTE, SECOND } from "./timer";

const DEFAULT_MICRO_PAUSE_INTERVAL = 4 * MINUTE;
const DEFAULT_WORK_BREAK_INTERVAL = 50 * MINUTE;
const DEFAULT_MICRO_PAUSE_DURATION = 13 * SECOND;
const DEFAULT_WORK_BREAK_DURATION = 8 * MINUTE;
const NATURAL_BREAK = 30 * SECOND;

export interface Config {
    microPauseInterval: number,
    workBreakInterval: number,
    microPauseDuration: number,
    workBreakDuration: number,
    naturalBreak: number,
}

export function getConfig(): Config {
    let config;
    try {
        config = workspace.getConfiguration('antirsi');
    } catch (e) {
        console.error(`Could not fetch config ${e}`);
    }

    return {
        microPauseInterval: config?.microPauseInterval || DEFAULT_MICRO_PAUSE_INTERVAL,
        workBreakInterval: config?.workBreakInterval || DEFAULT_WORK_BREAK_INTERVAL,
        microPauseDuration: config?.microPauseDuration || DEFAULT_MICRO_PAUSE_DURATION,
        workBreakDuration: config?.workBreakDuration || DEFAULT_WORK_BREAK_DURATION,
        naturalBreak: NATURAL_BREAK,
    } as Config;
}