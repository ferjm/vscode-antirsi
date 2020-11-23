import * as vscode from 'vscode';
import { Timer } from "./timer";

export class Break extends Timer {
    private _notificationResolver: Function;
    private _notificationProgress: vscode.Progress<any>;
    private _originalStatusBarColor: string | undefined;

    constructor(start: number = 0, label: string, onDone: Function) {
        const workbench = vscode.workspace.getConfiguration('workbench');

        super(start, () => {
            onDone();
            // Go back to previous status bar color.
            workbench.update('colorCustomizations', {
                'statusBar.background': this._originalStatusBarColor,
            });
            // Dismiss notification.
            this._notificationResolver();
        }, (time) => {
            this._updateUI(time);
        });

        // Show red status bar.
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
                onDone();
            });

            this._notificationProgress = progress;
            return new Promise(resolve => {
                this._notificationResolver = resolve;
            });
        });
    }

    private _updateUI(time: number) {
        this._notificationProgress.report({
            increment: this._convertMS(time),
            message: `${this._convertMS(time)}`
        });
    }

    public dispose() {
    }
}