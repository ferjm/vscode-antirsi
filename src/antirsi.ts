import * as vscode from 'vscode';
import { CountDirection, SECOND, Timer } from './timer';

export class AntiRSI {
    private static _instance: AntiRSI;

    private _keystrokesObserver: vscode.Disposable;

    private _microPauseTimer: Timer;
    private _workBreakTimer: Timer;
    private _keystrokeTimer: NodeJS.Timer;

    private _running: boolean = false;

    private constructor() {
        // Listen for keystrokes.
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this._onKeystroke, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onKeystroke, this, subscriptions);

        this._keystrokesObserver = vscode.Disposable.from(...subscriptions);

        // XXX Get this from config.
        this._workBreakTimer = new Timer(50 * 60 * SECOND, 'Break');
        this._microPauseTimer = new Timer(4 * 60 * SECOND, 'Pause');
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
            this._microPauseTimer.start(() => { });
            this._workBreakTimer.start(() => { });
        }
    }

    private _onKeystroke() {
        this.run();

        if (this._keystrokeTimer) {
            clearTimeout(this._keystrokeTimer);
        }

        this._microPauseTimer.switchDirection(CountDirection.down);
        this._workBreakTimer.switchDirection(CountDirection.down);

        // 10 seconds without activity will be considered a pause
        // and will make the timers switch counting direction.
        this._keystrokeTimer = setTimeout(() => {
            this._microPauseTimer.switchDirection(CountDirection.up);
            this._workBreakTimer.switchDirection(CountDirection.up);
        }, 10 * SECOND);
    }

    public dispose() {
        this._keystrokesObserver.dispose();
        this._microPauseTimer.dispose();
        this._workBreakTimer.dispose();
    }
}