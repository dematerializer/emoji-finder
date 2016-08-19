// input reducer

import { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } from './constants';
import { findEmojis } from '../utils';

const initialState = {
	queries: [[]], // array of user typed-in queries each represented by an array of characters
};

const selectCurrentQuery = (state) => state.queries[state.queries.length - 1];

export default function (state = initialState, action) {
	switch (action.type) {
		case ADD_CHARACTER: {
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map((query) =>
				(query === currentQuery) ? [ ...currentQuery, action.character ] : query
			),
		};
		}
		case REMOVE_CHARACTER: {
			const currentQuery = selectCurrentQuery(state);
			if (currentQuery.length === 0 && state.queries.length > 1) {
				return {
					...state,
					queries: state.queries.slice(0, -1),
				};
			} else {
				return {
					...state,
					queries: state.queries.map((query) =>
						(query === currentQuery) ? currentQuery.slice(0, -1) : query
					),
				};
			}
		}
		case SUBMIT: {
			const currentQuery = selectCurrentQuery(state);
			if (findEmojis(currentQuery.join('')).length === 1) {
				return {
					...state,
					queries: [ ...state.queries, [] ],
				};
			}
			return state;
		}
		default:
			return state;
	}
}
