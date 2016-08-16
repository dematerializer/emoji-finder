const readline = require('readline');
const chalk = require('chalk');
const hasAnsi = require('has-ansi');
const logUpdate = require('log-update');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const pre = `${chalk.bold.cyan('›')} `;
const query = [];

logUpdate(`${pre}${chalk.dim('start typing')}\n\n`);

process.stdin.on('keypress', (ch, key) => {
	if (hasAnsi(key.sequence)) {
		return;
	}

	// On ctrl+c clear output and exit:
	if (key.ctrl && key.name === 'c') {
		logUpdate();
		readline.moveCursor(process.stdout, 0, -1);
		process.exit();
	}

	let queryStr = query.join('');

	if (key.name === 'backspace') {
		query.pop();
	} else if (key.name === 'return') {
		query.length = 0;
	} else {
		query.push(ch);
	}

	queryStr = query.join('');
	logUpdate(`${pre}${chalk.bold(queryStr)}\n`);
});
