import * as vscode from 'vscode';
import { Break } from './break';
import { NextBreak } from './next_break';
import { CountDirection, SECOND, Timer } from './timer';

export class AntiRSI {
    private static _instance: AntiRSI;

    private _keystrokesObserver: vscode.Disposable;

    // Timers for the next micro pause or the next work break.
    private _nextMicroPauseTimer: Timer;
    private _nextWorkBreakTimer: Timer;

    // Timer for the actual micro pause or work break.
    private _breakTimer: Timer;

    private _keystrokeTimer: NodeJS.Timer;

    private _running: boolean = false;

    private constructor() {
        // Listen for keystrokes.
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this._onKeystroke, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onKeystroke, this, subscriptions);

        this._keystrokesObserver = vscode.Disposable.from(...subscriptions);
    }

    public static getInstance(): AntiRSI {
        if (AntiRSI._instance === null || AntiRSI._instance === undefined) {
            AntiRSI._instance = new AntiRSI();
        }
        return AntiRSI._instance;
    }

    public run() {
        if (!this._running) {
            this._running = true;

            // XXX Get this from config.
            this._nextWorkBreakTimer = new NextBreak(50 * 60 * SECOND, 'Break', () => {
                this._nextWorkBreakTimer.stop();
                this._nextWorkBreakTimer.dispose();
            });
            this._nextMicroPauseTimer = new NextBreak(10 * SECOND, 'Pause', () => {
                this._nextMicroPauseTimer.stop();
                this._nextMicroPauseTimer.dispose();
                this._breakTimer = new Break(10 * SECOND, 'Micro Pause', () => {
                    // XXX Go back to next micro pause timer.
                });
                this._breakTimer.start();
            });

            this._nextMicroPauseTimer.start();
            this._nextWorkBreakTimer.start();
        }
    }

    private _onKeystroke() {
        if (this._breakTimer !== undefined) {
            return;
        }

        this.run();

        if (this._keystrokeTimer) {
            clearTimeout(this._keystrokeTimer);
        }

        this._nextMicroPauseTimer.switchDirection(CountDirection.down);
        this._nextWorkBreakTimer.switchDirection(CountDirection.down);

        // 20 seconds without activity will be considered a pause
        // and will make the timers switch counting direction.
        this._keystrokeTimer = setTimeout(() => {
            this._nextMicroPauseTimer.switchDirection(CountDirection.up);
            this._nextWorkBreakTimer.switchDirection(CountDirection.up);
        }, 20 * SECOND);
    }

    public dispose() {
        this._keystrokesObserver.dispose();
        this._nextMicroPauseTimer.dispose();
        this._nextWorkBreakTimer.dispose();
    }
}