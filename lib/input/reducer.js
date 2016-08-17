// input reducer

const sequence = require('./sequence-reducer');
const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');

const initialState = {
	prompt: '›',
	placeholder: 'start typing',
	sequence: sequence(undefined, { type: 'INITIAL' }),
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case ADD_CHARACTER:
			return Object.assign({}, state, {
				sequence: sequence(state.sequence, action)
			});
		case REMOVE_CHARACTER:
			return Object.assign({}, state, {
				sequence: sequence(state.sequence, action)
			});
		case SUBMIT:
			return Object.assign({}, state, {
				sequence: sequence(state.sequence, action)
			});
		default:
			return state;
	}
};

module.exports = reducer;
