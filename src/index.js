// index

import { combineReducers, createStore } from 'redux';
import logUpdate from 'log-update';
import readline from 'readline';
import hasAnsi from 'has-ansi';

import inputReducer from './reducer';
import {
	setData,
	addCharacter,
	removeCharacter,
	selectNextSuggestion,
	selectPreviousSuggestion,
	submit,
} from './actions';
import data from './data';
import selectStyledInput from './selectors';

// Configure store:

const rootReducer = combineReducers({
	input: inputReducer,
});

const store = createStore(rootReducer);

// Set emoji data:

store.dispatch(setData(data));

// Render once initially and every time the store changes:

const render = () => logUpdate(selectStyledInput(store.getState()));
// const render = () => {
// 	const state = store.getState();
// 	// selectStyledInput(state);
// 	console.dir(state.input.queries);
// };
store.subscribe(render);
render();

// Transform raw keypress events into actions:

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (character, key) => {
	// Navigate suggestions with (shift+)tab or arrow keys:
	if (key.name === 'left' || (key.shift && key.name === 'tab')) {
		store.dispatch(selectPreviousSuggestion());
	} else if (key.name === 'right' || key.name === 'tab') {
		store.dispatch(selectNextSuggestion());
	}

	// Don't process ANSI input and tabs any further:
	if (hasAnsi(key.sequence) || key.name === 'tab') {
		return;
	}

	// On ctrl+c clear output and exit:
	if (key.ctrl && key.name === 'c') {
		logUpdate.clear();
		process.exit();
	}

	// Delete/submit/add character with backspace/return/any other key:
	if (key.name === 'backspace') {
		store.dispatch(removeCharacter());
	} else if (key.name === 'return') {
		store.dispatch(submit());
	} else {
		store.dispatch(addCharacter(character));
	}
});
