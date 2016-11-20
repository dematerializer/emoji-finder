// Main entry point for CLI

import 'regenerator-runtime/runtime';

import { combineReducers, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { takeEvery } from 'redux-saga';
import { select } from 'redux-saga/effects';
import logUpdate from 'log-update';
import copyPaste from 'copy-paste';
import chalk from 'chalk';
import readline from 'readline';
import hasAnsi from 'has-ansi';

import inputReducer from './reducer';
import { SUBMIT } from './constants';
import {
	setData,
	addCharacter,
	removeCharacter,
	selectNextSuggestion,
	selectPreviousSuggestion,
	submit,
} from './actions';
import getDataForLanguage from './data';
import {
	selectInput,
	selectQueries,
	selectStyledInput,
} from './selectors';

// Configure store with reducer and saga middleware:

const rootReducer = combineReducers({
	input: inputReducer,
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

// Set emoji data:

const languageFromEnv = (process.env.LANG || 'en').split('.')[0].split('_')[0];
const languageFromArgs = process.argv[2];
let language = languageFromArgs || languageFromEnv;

if (!['en', 'de'].includes(language)) {
	logUpdate(`⌨ ${language} not upported, using en`);
	logUpdate.done();
	language = 'en';
} else {
	logUpdate(`⌨ ${language}`);
	logUpdate.done();
}

store.dispatch(setData(getDataForLanguage(language)));

// Listen for SUBMIT actions.
// If the input emoji sequence needs to be submitted,
// copy the sequence of emoji to the clipboard, print
// out a final message and exit the application:

function* copyEmojiSequenceAndExit() {
	const input = yield select(selectInput);
	if (!input.submitted) {
		return;
	}
	const queries = yield select(selectQueries);
	const emojiSequence = queries.filter(query => query.emoji != null).map(query => query.emoji).join('');
	copyPaste.copy(emojiSequence);
	logUpdate(chalk.yellow('💾 📋 ✓'));
	logUpdate.done();
	process.exit(0);
}

function* inputEmojiSequenceSubmitted() {
	yield takeEvery(SUBMIT, copyEmojiSequenceAndExit);
}

sagaMiddleware.run(inputEmojiSequenceSubmitted);

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
