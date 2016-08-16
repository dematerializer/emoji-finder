const { createStore, combineReducers } = require('redux');
const { createSelector } = require('reselect');
const chalk = require('chalk');
const logUpdate = require('log-update');
const readline = require('readline');
const hasAnsi = require('has-ansi');

// Action constants:

const ADD_CHARACTER = 'ADD_CHARACTER';
const REMOVE_CHARACTER = 'REMOVE_CHARACTER';
const SUBMIT = 'SUBMIT';

// Action creators:

const addCharacter = character => ({ type: ADD_CHARACTER, character });
const removeCharacter = () => ({ type: REMOVE_CHARACTER });
const submit = () => ({ type: SUBMIT });

// Reducers:

const initialState = {
	prompt: '›',
	placeholder: 'start typing',
	characters: [],
};

const input = (state = initialState, action) => {
	switch (action.type) {
		case ADD_CHARACTER:
			return Object.assign({}, state, {
				characters: [...state.characters, action.character]
			});
		case REMOVE_CHARACTER:
			return Object.assign({}, state, {
				characters: state.characters.slice(0, -1),
			});
		case SUBMIT:
			return Object.assign({}, state, {
				characters: [],
			});
		default:
			return state;
	}
};

// Selectors:

const selectInput = state => state.input;
const selectPrompt = state => state.input.prompt;
const selectPlaceholder = state => state.input.placeholder;
const selectCharacters = state => state.input.characters;
const selectStyledInput = createSelector(
	selectPrompt,
	selectPlaceholder,
	selectCharacters,
	(prompt, placeholder, characters) => {
		const styledPrompt = chalk.bold.yellow(prompt);
		const styledPlaceholder = chalk.dim(placeholder);
		const styledCharacters = chalk.bold.yellow(characters.join(''));
		const styledText = characters.length > 0 ? styledCharacters : styledPlaceholder
		return `${styledPrompt} ${styledText}`;
	}
);

// Initialize store:

const rootReducer = combineReducers({
	input,
});
const store = createStore(rootReducer);

// Render once initially and every time the store changes:

const render = () => logUpdate(selectStyledInput(store.getState()));
store.subscribe(render);
render();

// Transform raw keypress events into actions:
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (character, key) => {

	// Don't process ANSI input:
	if (hasAnsi(key.sequence)) {
		return;
	}

	// On ctrl+c clear output and exit:
	if (key.ctrl && key.name === 'c') {
		logUpdate.clear();
		process.exit();
	}

	// Dispatch appropriate actions:
	const action = null;
	if (key.name === 'backspace') {
		store.dispatch(removeCharacter());
	} else if (key.name === 'return') {
		store.dispatch(submit());
	} else {
		store.dispatch(addCharacter(character));
	}
});
