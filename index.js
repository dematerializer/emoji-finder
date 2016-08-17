// index

const { combineReducers, createStore } = require('redux');
const logUpdate = require('log-update');
const readline = require('readline');
const hasAnsi = require('has-ansi');

const inputReducer = require('./lib/input/reducer');
const { addCharacter, removeCharacter, submit } = require('./lib/input/actions');
const { selectStyledInput } = require('./lib/input/selectors');

// Configure store:

const rootReducer = combineReducers({
	input: inputReducer,
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
