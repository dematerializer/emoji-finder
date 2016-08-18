// item reducer

const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');

const initialState = {
	query: [],   // typed query represented by an array of characters
	emoji: null, // search result of the query if exactly one match, null otherwise
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case ADD_CHARACTER:
			return Object.assign({}, state, {
				query: [ ...state.query, action.character ],
			});
		case REMOVE_CHARACTER:
			return Object.assign({}, state, {
				query: state.query.slice(0, -1),
			});
		case SUBMIT:
			return {
				query: [],
				emoji: null,
			};
		default:
			return state;
	}
};

module.exports = reducer;
