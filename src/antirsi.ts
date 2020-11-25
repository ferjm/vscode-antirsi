import * as vscode from 'vscode';
import { Break } from './break';
import { getConfig } from './config';
import { NextBreak } from './next_break';
import { CountDirection, SECOND, Timer } from './timer';

export class AntiRSI {
    private static _instance: AntiRSI;

    private _keystrokesObserver: vscode.Disposable;
    private _keystrokesTimer: NodeJS.Timer;

    // Timers for the next micro pause or the next work break.
    private _nextMicroPauseTimer: Timer;
    private _nextWorkBreakTimer: Timer;

    // Timer for the actual micro pause or work break.
    private _breakTimer: Timer | undefined;

    private _running: boolean = false;

    private constructor() {
        this._listenForKeystrokes();
    }

    public static getInstance(): AntiRSI {
        if (AntiRSI._instance === null || AntiRSI._instance === undefined) {
            AntiRSI._instance = new AntiRSI();
        }
        return AntiRSI._instance;
    }

    private _listenForKeystrokes() {
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this._onKeystroke, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onKeystroke, this, subscriptions);

        this._keystrokesObserver = vscode.Disposable.from(...subscriptions);
    }

    public run(listenForKeystrokes: boolean = false) {
        if (this._running) {
            return;
        }
        this._running = true;
        this._startNextWorkBreakTimer();
        this._startNextMicroPauseTimer();
        if (listenForKeystrokes) {
            this._listenForKeystrokes();
        }
    }

    public stop() {
        if (!this._running) {
            return;
        }
        this._running = false;
        this.dispose();
    }

    public reset() {
        if (!this._running || this._breakTimer) {
            return;
        }
        this._nextWorkBreakTimer.reset();
        this._nextMicroPauseTimer.reset();
        this._nextWorkBreakTimer.start();
        this._nextMicroPauseTimer.start();
    }

    private _startNextMicroPauseTimer() {
        this._nextMicroPauseTimer = new NextBreak(getConfig().microPauseInterval, 'Pause', this._onNextMicroPause.bind(this));
        this._nextMicroPauseTimer.start();
    }

    private _onNextMicroPause() {
        this._nextMicroPauseTimer.stop();
        this._nextMicroPauseTimer.dispose();
        this._breakTimer = new Break(getConfig().microPauseDuration, 'Micro Pause', () => {
            this._disposeBreak();
            this._startNextMicroPauseTimer();
        });
        this._breakTimer.start();
    }

    private _startNextWorkBreakTimer() {
        this._nextWorkBreakTimer = new NextBreak(getConfig().workBreakInterval, 'Break', this._onNextWorkBreak.bind(this));
        this._nextWorkBreakTimer.start();

    }

    private _onNextWorkBreak() {
        this._nextWorkBreakTimer.stop();
        this._nextWorkBreakTimer.dispose();
        this._breakTimer = new Break(getConfig().workBreakDuration, 'Work Break', () => {
            this._disposeBreak();
            this._startNextWorkBreakTimer();
        });
        this._breakTimer.start();
    }

    private _disposeBreak() {
        this._breakTimer?.stop();
        this._breakTimer?.dispose();
        this._breakTimer = undefined;
    }

    private _onKeystroke() {
        if (this._breakTimer !== undefined) {
            return;
        }

        this.run();

        if (this._keystrokesTimer) {
            clearTimeout(this._keystrokesTimer);
        }

        this._nextMicroPauseTimer.switchDirection(CountDirection.down);
        this._nextWorkBreakTimer.switchDirection(CountDirection.down);

        // 20 seconds without activity will be considered a pause
        // and will make the timers switch counting direction.
        this._keystrokesTimer = setTimeout(() => {
            this._nextMicroPauseTimer.switchDirection(CountDirection.up);
            this._nextWorkBreakTimer.switchDirection(CountDirection.up);
        }, getConfig().naturalBreak);
    }

    public dispose() {
        this._keystrokesObserver.dispose();
        this._nextMicroPauseTimer.dispose();
        this._nextWorkBreakTimer.dispose();
        this._disposeBreak();
        if (this._keystrokesTimer) {
            clearTimeout(this._keystrokesTimer);
        }
    }
}