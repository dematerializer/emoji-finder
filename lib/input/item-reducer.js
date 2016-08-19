// item reducer

import { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } from './constants';
import emojis from 'emojigotchi-emojis';

const initialState = {
	query: [],   // typed query represented by an array of characters
	emoji: null, // result of the query if exactly one match, null otherwise
};

const findEmojis = (query) => {
	return emojis.filter(
		(emoji) => emoji.keywords.includes(query)
	);
};

export default function (state = initialState, action) {
	switch (action.type) {
		case ADD_CHARACTER:
			return {
				...state,
				query: [ ...state.query, action.character ],
			};
		case REMOVE_CHARACTER:
			return {
				...state,
				query: state.query.slice(0, -1),
			};
		case SUBMIT: {
			const results = findEmojis(state.query.join(''));
			return {
				...state,
				emoji: results.length === 1 ? results[0].chars : null,
			};
		}
		default:
			return state;
	}
}
