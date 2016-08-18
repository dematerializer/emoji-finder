// item reducer

const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');
const emojis = require('emojigotchi-emojis');

const initialState = {
	query: [],   // typed query represented by an array of characters
	emoji: null, // result of the query if exactly one match, null otherwise
};

const findEmojis = (query) => {
	return emojis.filter(
		(emoji) => emoji.keywords.includes(query)
	);
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
		case SUBMIT: {
			const results = findEmojis(state.query.join(''));
			return Object.assign({}, state, {
				emoji: results.length === 1 ? results[0].chars : null,
			});
		}
		default:
			return state;
	}
};

module.exports = reducer;
