const readline = require('readline');
const color = require('ansi-color').set;
const emojiReducer = require('emojigotchi-core').reducer;
const emojis = require('emojigotchi-emojis');

const initIo = ({ onInput, promptPrefix }) => {
	const log = (message, rlInterface) => {
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		console.log(message);
		rlInterface.prompt(true);
	};
	function completer(line) {
		const isInteger = str => /^\+?(0|[1-9]\d*)$/.test(str);
		let lineWithoutIndex = line;
		let lastCharacter = line[line.length - 1];
		let justTheIndex = null;
		if (line.length > 0 && isInteger(lastCharacter)) {
			lineWithoutIndex = line.slice(0, -1);
			justTheIndex = lastCharacter;
		}
		var hits = emojis
			.filter(emoji => emoji.keywords.includes(lineWithoutIndex))
			.map((emoji, index) => {
				return {
					chars: emoji.chars,
					index,
				};
			})
			.filter(emoji => justTheIndex == null ? true : emoji.index == justTheIndex)
			.map(emoji => {
				return `${emoji.index}) ${emoji.chars}`;
			});
		// var completions = 'smile 😊;wink 😉;kiss 😘'.split(';');
		// var hits = completions.filter((c) => {
		// 	return c.indexOf(line) == 0
		// });
		if (hits.length === 1) {
			// process.stdout.clearLine();
			// process.stdout.cursorTo(0);
			// process.stdin.write('xxx');
			// rlInterface.prompt(true);
		}
		return [hits.length ? hits : [], hits.length === 1 ? '' : line];
		// return [hits.length ? hits : [], line];
	}
	// readline.emitKeypressEvents(process.stdin);
	// process.stdin.setRawMode(true);
	const rlInterface = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		completer,
	});
	rlInterface.setPrompt(promptPrefix);
	rlInterface.prompt(true);
	rlInterface.on('line', function (line) {
		process.stdout.moveCursor(0, -1);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		onInput(line, (message) => {
			log(promptPrefix + message, rlInterface);
		});
		rlInterface.prompt(true);
	});
	return {
		log: (message) => {
			log(message, rlInterface);
		},
	};
};

const startRunLoop = ({ onTick }) => {
	const tick = () => {
		onTick();
	};
	let interval = null;
	const startInterval = () => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
		interval = setInterval(tick, 5000);
	};
	startInterval();
	return {
		doTickNow: () => {
			tick();
			startInterval();
		},
	}
};

const { log } = initIo({
	promptPrefix: '👉  ',
	onInput: (message, log) => {
		if (message.trim() !== '') {
			log(color(message, 'magenta'));
			// TODO: set model input
			doTickNow(); // user wants an immediate response
		}
	},
});

const { doTickNow } = startRunLoop({
	onTick: () => {
		// TODO: update model based on input and timing
		log(color('🏡  update', 'yellow'));
	},
});

// emojis
// .filter(emoji => emoji.keywords.includes('face'))
// .forEach((emoji, i) => {
// 	process.stdout.write(emoji.chars + '  ');
// 	if ((i + 1) % 20 === 0) process.stdout.write('\n');
// });
// console.log('\n');
