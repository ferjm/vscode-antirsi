import * as vscode from 'vscode';
import { AntiRSI } from './antirsi';

/*

High level algorithm
--------------------

- Activate on launch (*)
- Listen for keystrokes:
	- On first key stroke:
		- Set up two intervals and two counters:
			- Micro pauses (4 minutes by default)
			- Work breaks (50 minutes by default)
			- Decrease countdown value on each interval spin
		- Set up one timer:
			- Reset timer on each keystroke
			- If timer fires, switch to increase countdowns until
			  new keystroke is handled
		- If countdown reaches 0
			- Set pause / work break mode:
				- Change theme
				- Start pause counter
				- Show notification with progress bar
				- If keystroke is handled, reset counter and start over
				- When progress reaches end, go back to normal mode and
				  reset countdown that triggered the break
*/

export function activate(context: vscode.ExtensionContext) {
	// Set up controller.
	const antiRSI = AntiRSI.getInstance();

	// Register for clean up.
	context.subscriptions.push(antiRSI);

	vscode.commands.registerCommand(`antirsi.run`, () => antiRSI.run(/* listenForKeystrokes */ true));
	vscode.commands.registerCommand(`antirsi.stop`, () => antiRSI.stop());
	vscode.commands.registerCommand(`antirsi.reset`, () => antiRSI.reset());
}

export function deactivate() { }
