import * as vscode from 'vscode';
import { Timer } from "./timer";

export class Break extends Timer {
    private _notificationResolver: Function;
    private _notificationProgress: vscode.Progress<any>;
    private _originalStatusBarColor: string | undefined;
    private _keystrokesObserver: vscode.Disposable;

    constructor(start: number = 0, label: string, onDone: Function) {
        super(start, () => {
            this._dismissUI();
            onDone();
        }, (time) => {
            this._updateUI(time);
        });

        // Show red status bar.
        const workbench = vscode.workspace.getConfiguration('workbench');
        this._originalStatusBarColor = workbench.get('statusBar.background');
        workbench.update('colorCustomizations', {
            'statusBar.background': 'red'
        });

        // Show notification with progress.
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: label,
            cancellable: true,
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                this._dismissUI();
                onDone();
            });

            this._notificationProgress = progress;
            return new Promise(resolve => {
                this._notificationResolver = resolve;
            });
        });

        // Listen for keystrokes.
        // Every time we detect activity, we restart the counter.
        // Breaks are meant to be respected!
        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this._onKeystroke, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onKeystroke, this, subscriptions);

        this._keystrokesObserver = vscode.Disposable.from(...subscriptions);

    }

    private _updateUI(time: number) {
        // Update notification progress with the time remaining
        // for the break.
        this._notificationProgress.report({
            increment: this._convertMS(time),
            message: `${this._convertMS(time)}`
        });
    }

    private _dismissUI() {
        // Go back to previous status bar color.
        vscode.workspace.getConfiguration('workbench').update('colorCustomizations', {
            'statusBar.background': this._originalStatusBarColor,
        });
        // Dismiss notification.
        this._notificationResolver();
    }

    private _onKeystroke() {
        // If the user has activity while on a break,
        // we reset the break and start over.
        this.reset();
        this.start();
    }

    public dispose() {
        this._keystrokesObserver.dispose();
    }
}