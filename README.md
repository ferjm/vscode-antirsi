# antirsi README

AntiRSI is a Visual Code Extension that helps prevent RSI (Repetitive Strain Injury). It does so by forcing you to take regular breaks, yet without getting in the way. It also detects natural breaks so it will not force too many breaks on you.

## How it works

By default, the extension shows two timers on the status bar:

- Next micro pause countdown. 4 minutes by default.
- Next work break countdown. 50 minutes by default.

The countdowns starts as soon as the extension detects activity on the editor. It will not stop until a natural break is detected or until it reaches the end.

If a natural break is detected, the timers will stop and they will start counting up, until new activity is detected.

When a countdown finishes, a break is suggested by changing the IDE status bar color to red and showing a notification with a new countdown and the type of break. There are two types of breaks:

- Micro pauses. 12 seconds by default.
- Work breaks. 8 minutes by default.

All breaks can be canceled and postponed.

Sit up straight, don't slouch and do your [streching excercises](https://www.rsipain.com/stretching-exercises.php)!

## Commands
This extension contributes the following commands (Cmd+Shift+P on MacOs, Ctrl+Shift+P on Windows and Linux):

- `AntiRSI: Run`: Starts the AntiRSI timers if they are not already running. Timers also start automatically after detecting editor activity unless a previous `Stop` command was executed. In that case, an explicit `Run` command is required.
- `AntiRSI: Stop`: Stops the AntiRSI timers.
- `AntiRSI: Reset`: Resets the AntiRSI timers. This command will not work during micro pauses or work breaks.

## License

MIT @ Fernando Jiménez Moreno
