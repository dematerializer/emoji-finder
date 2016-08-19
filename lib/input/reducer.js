// input reducer

import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_SUGGESTION_LEFT,
	SELECT_SUGGESTION_RIGHT,
	SUBMIT,
} from './constants';
import { findEmojis, clamp } from '../utils';

const initialState = {
	queries: [[]], // array of user typed-in queries each represented by an array of characters
	selectedSuggestionIndex: 0,
};

const selectCurrentQuery = (state) => state.queries[state.queries.length - 1];

export default function (state = initialState, action) {
	switch (action.type) {
		case ADD_CHARACTER: {
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					(query === currentQuery) ? [ ...currentQuery, action.character ] : query,
				),
				selectedSuggestionIndex: 0,
			};
		}
		case REMOVE_CHARACTER: {
			const currentQuery = selectCurrentQuery(state);
			if (currentQuery.length === 0 && state.queries.length > 1) {
				return {
					...state,
					queries: state.queries.slice(0, -1),
					selectedSuggestionIndex: 0,
				};
			} else {
				return {
					...state,
					queries: state.queries.map(query =>
						(query === currentQuery) ? currentQuery.slice(0, -1) : query
					),
					selectedSuggestionIndex: 0,
				};
			}
		}
		case SELECT_SUGGESTION_LEFT: {
			const currentQuery = selectCurrentQuery(state);
			const resultLength = findEmojis(currentQuery.join('')).length;
			const clampedIndex = clamp(state.selectedSuggestionIndex - 1, 0, 7 - 1); // TODO: extract 7
			if (clampedIndex === state.selectedSuggestionIndex) {
				return state;
			}
			return {
				...state,
				selectedSuggestionIndex: clampedIndex,
			}
		}
		case SELECT_SUGGESTION_RIGHT: {
			const currentQuery = selectCurrentQuery(state);
			const resultLength = findEmojis(currentQuery.join('')).length;
			const clampedIndex = clamp(state.selectedSuggestionIndex + 1, 0, 7 - 1); // TODO: extract 7
			if (clampedIndex === state.selectedSuggestionIndex) {
				return state;
			}
			return {
				...state,
				selectedSuggestionIndex: clampedIndex,
			}
		}
		case SUBMIT: {
			const currentQuery = selectCurrentQuery(state);
			const updatedQueries = state.queries.map(query =>
				(query === currentQuery) ? [ ...currentQuery, state.selectedSuggestionIndex] : query
			);
			return {
				...state,
				queries: [ ...updatedQueries, [] ],
				selectedSuggestionIndex: 0,
			};
		}
		default:
			return state;
	}
}
