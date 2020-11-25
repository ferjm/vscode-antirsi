import * as vscode from 'vscode';

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export enum CountDirection {
    down,
    up
};

export interface OnTick {
    (time: number): void;
}

export class Timer {
    private _currentTime: number;
    private _startTime: number;
    private _timer: NodeJS.Timer;
    private _countDirection: CountDirection = CountDirection.down;
    private _running: boolean = false;
    private _ondone: Function;
    private _ontick: Function;

    constructor(start: number = 0, onDone: Function, onTick: OnTick) {
        this._startTime = start;
        this._currentTime = start;
        this._ondone = onDone;
        this._ontick = onTick;
    }

    public start() {
        if (this._running) {
            return;
        }
        this._running = true;
        this._timer = setInterval(() => {
            this._tick();

            this._ontick(this._currentTime);

            if (this._currentTime <= 0) {
                this.stop();
                this._ondone();
            } else if (this._currentTime >= this._startTime) {
                this.stop();
            }
        }, SECOND);
    }

    public stop() {
        clearInterval(this._timer);
        this._running = false;
    }

    public reset() {
        this.stop();
        this._currentTime = this._startTime;
    }

    public switchDirection(direction: CountDirection) {
        this._countDirection = direction;
        this.start();
    }

    private _tick() {
        if (this._countDirection === CountDirection.down) {
            this._currentTime -= SECOND;
        } else {
            this._currentTime += SECOND;
        }
    }

    protected _convertMS(ms: number): string {
        const date = new Date(ms);
        let str = '';
        const hours = date.getUTCHours();
        if (hours > 0) {
            if (hours === 1) {
                return `${hours} hour`;
            }
            return `${hours} hours`;
        }
        const minutes = date.getUTCMinutes();
        if (minutes > 0) {
            return `${minutes} min.`;
        }
        return `${date.getUTCSeconds()} sec.`;
    };

    public dispose() {
        this.stop();
    }
}