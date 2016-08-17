// sequence reducer

const query = require('./query-reducer');
const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');

const initialState = [{
	query: query(undefined, { type: 'INITIAL' }), // typed query represented by an array of characters
	emoji: null, // search result of the query if exactly one match, null otherwise
}];

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case ADD_CHARACTER:
			return [{
				query: query(state[0].query, action),
				emoji: null,
			}];
		case REMOVE_CHARACTER:
			return [{
				query: query(state[0].query, action),
				emoji: null,
			}];
		case SUBMIT:
			return [{
				query: query(state[0].query, action),
				emoji: null,
			}];
		default:
			return state;
	}
};

module.exports = reducer;
