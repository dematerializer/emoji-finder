#!/usr/bin/env node

// Main entry point for CLI

import 'regenerator-runtime/runtime';

import { combineReducers, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import logUpdate from 'log-update';
import readline from 'readline';
import hasAnsi from 'has-ansi';
import meow from 'meow';

import inputReducer from './reducer';
import {
	addCharacter,
	removeCharacter,
	selectNextSuggestion,
	selectPreviousSuggestion,
	submit,
	selectPreviousQuery,
	selectNextQuery,
	setFindSuggestedEmoji,
} from './actions';
import getDataForLanguage from './data';
import { inputEmojiSequenceSubmitted, currentQueryChanged } from './sagas';
import { selectStyledInput } from './selectors';
import { createSelectSuggestedEmojiForQuery } from './query-selectors';

const cli = meow(`
    Usage
      $ emoji-finder [de|en]

    Options
      --dango Use dango (https://getdango.com/),
              internet connectivity required,
              sets input language to 'en'.

    Run without arguments to use the input language set in
    your environment (echo $LANG). Falls back to 'en' if
    not available or not supported.
`);

// Configure store with reducer and saga middleware:

const rootReducer = combineReducers({
	input: inputReducer,
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

// Set emoji data:

const languageFromEnv = (process.env.LANG || 'en').split('.')[0].split('_')[0];
const languageFromArgs = cli.flags.dango ? 'en' : cli.input[0];
let language = languageFromArgs || languageFromEnv;

if (!['en', 'de'].includes(language)) {
	logUpdate(`⌨ ${language} not upported, using en`);
	logUpdate.done();
	language = 'en';
} else {
	logUpdate(`⌨ ${language}`);
	logUpdate.done();
}

const data = getDataForLanguage(language);

sagaMiddleware.run(inputEmojiSequenceSubmitted);

if (cli.flags.dango) {
	sagaMiddleware.run(currentQueryChanged, data); // data still needed for annotations!
} else {
	store.dispatch(setFindSuggestedEmoji(createSelectSuggestedEmojiForQuery(data)));
}

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
	} else if (key.name === 'up') {
		store.dispatch(selectPreviousQuery());
	} else if (key.name === 'down') {
		store.dispatch(selectNextQuery());
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
