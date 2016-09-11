// input query reducer

import { createSelector } from 'reselect';
import copyPaste from 'copy-paste';

import { findEmojis } from '../utils';

import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_SUGGESTION_LEFT,
	SELECT_SUGGESTION_RIGHT,
	SUBMIT,
} from './constants';

const selectSearchTerm = (state) => state.searchTerm.join('');
const createSelectSuggestedEmojisForQuery = () => createSelector(
	selectSearchTerm,
	searchTerm => findEmojis(searchTerm)
);

const restrictSelectedSuggestionIndex = (state, index) => {
	const resultLength = state.suggestedEmojis(state).length;
	const maxIndex = Math.min(resultLength - 1, 7 - 1); // TODO: extract 7
	let movedIndex = index;
	if (movedIndex > maxIndex) {
		movedIndex = 0;
	} else if (movedIndex < 0) {
		movedIndex = maxIndex;
	}
	return movedIndex;
};

const initialState = {
	searchTerm: [], // // user typed-in array of characters
	selectedSuggestionIndex: 0, // index of the user-selected emoji from the list of suggestions for the search term
	emoji: null, // resulting emoji
	suggestedEmojis: createSelectSuggestedEmojisForQuery(), // memoized selector for this instance
};

export default function (state = initialState, action) {
	switch (action.type) {
		case ADD_CHARACTER:
			return {
				...state,
				searchTerm: [ ...state.searchTerm, action.character ],
				selectedSuggestionIndex: 0,
			}
		case REMOVE_CHARACTER:
			return {
				...state,
				searchTerm: state.searchTerm.slice(0, -1),
				selectedSuggestionIndex: 0,
				emoji: null,
			}
		case SELECT_SUGGESTION_LEFT: {
			const index = restrictSelectedSuggestionIndex(state, state.selectedSuggestionIndex - 1);
			return {
				...state,
				selectedSuggestionIndex: index,
			}
		}
		case SELECT_SUGGESTION_RIGHT: {
			const index = restrictSelectedSuggestionIndex(state, state.selectedSuggestionIndex + 1);
			return {
				...state,
				selectedSuggestionIndex: index,
			}
		}
		case SUBMIT: {
			if (state.searchTerm.length > 0) {
				const suggestions = state.suggestedEmojis(state); // memoized
				const emoji = suggestions.length ? suggestions[state.selectedSuggestionIndex].presentation.default.output : null;
				if (emoji) {
					copyPaste.copy(emoji);
				}
				return { ...state, emoji };
			}
			return state;
		}
		default:
			return state;
	}
}