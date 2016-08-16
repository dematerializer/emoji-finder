const { createStore, combineReducers } = require('redux');
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

const rootReducer = combineReducers({
	input,
});
const store = createStore(rootReducer);

const render = () => {
	const prompt = chalk.bold.cyan('›');
	const placeholder = chalk.dim('start typing');
	const characters = store.getState().input.characters;
	const text = characters.length > 0 ? characters.join('') : placeholder;
	logUpdate(`${prompt} ${text}`);
};

// Render once initially and every time the store changes:
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
