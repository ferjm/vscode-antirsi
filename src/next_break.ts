import { TreeViewSelectionChangeEvent } from "vscode";
import * as vscode from 'vscode';
import { Timer } from "./timer";

export class NextBreak extends Timer {
    private _ui: vscode.StatusBarItem;
    private _label: string;

    constructor(start: number = 0, label: string, onDone: Function) {
        super(start, onDone, (time) => {
            this._updateUI(time);
        });
        this._ui = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this._label = label;
        this._ui.show();
    }

    private _updateUI(time: number) {
        this._ui.text = `${this._label}: ${this._convertMS(time)}`;
    }

    public dispose() {
        this._ui.dispose();
    }
}