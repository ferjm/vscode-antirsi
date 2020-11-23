import * as vscode from 'vscode';

export const SECOND = 1000;

export enum CountDirection {
    down,
    up
};

export class Timer {
    private _currentTime: number;
    private _startTime: number;
    private _timer: NodeJS.Timer;
    private _countDirection: CountDirection = CountDirection.down;
    private _ui: vscode.StatusBarItem;
    private _label: string;
    private _running: boolean = false;

    constructor(start: number = 0, label: string) {
        this._startTime = start;
        this._currentTime = start;
        this._ui = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this._label = label;
        this._updateUI();
        this._ui.show();
    }

    public start(onDone: Function) {
        if (this._running) {
            return;
        }
        this._running = true;
        this._timer = setInterval(() => {
            this._tick();

            this._updateUI();

            if (this._currentTime <= 0) {
                this.stop();
                onDone();
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
    }

    private _tick() {
        if (this._countDirection === CountDirection.down) {
            this._currentTime -= SECOND;
        } else {
            this._currentTime += SECOND;
        }
    }

    private _convertMS(ms: number): string {
        function pad(num: number) {
            return ('00' + num).slice(-2);
        }
        var mins, secs;
        secs = Math.floor(ms / 1000);
        mins = Math.floor(secs / 60);
        secs = secs % 60;

        return pad(mins) + ':' + pad(secs);
    };

    private _updateUI() {
        this._ui.text = `${this._label}: ${this._convertMS(this._currentTime)}`;
    }

    public dispose() {
        this.stop();
        this._ui.dispose();
    }
}