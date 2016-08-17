// query reducer

const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');

const reducer = (state = [], action) => {
	switch (action.type) {
		case ADD_CHARACTER:
			return [ ...state, action.character ];
		case REMOVE_CHARACTER:
			return state.slice(0, -1);
		case SUBMIT:
			return [];
		default:
			return state;
	}
};

module.exports = reducer;
