// input query reducer

import { createSelector } from 'reselect';

import { findEmoji } from './search';

import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_NEXT_SUGGESTION,
	SELECT_PREVIOUS_SUGGESTION,
	SUBMIT,
} from './constants';

// Returns the search term as a string:
const selectSearchTerm = state => state.searchTerm.join('');

// Creates a memoized selector that returns a list
// of emoji that match the current search term:
const selectSuggestedEmojiForQuery = () => createSelector(
	selectSearchTerm,
	searchTerm => findEmoji(searchTerm)
);

// Clamps a given index between 0 and the max
// number of results while enabling it to cycle:
const restrictSelectedSuggestionIndex = (state, index) => {
	const resultLength = state.suggestedEmoji(state).length; // memoized
	const maxIndex = Math.min(resultLength - 1, 7 - 1); // TODO: extract 7
	let movedIndex = index;
	if (movedIndex > maxIndex) {
		movedIndex = 0;
	} else if (movedIndex < 0) {
		movedIndex = maxIndex;
	}
	return movedIndex;
};

// Initial state of a newly created query:
const initialState = {
	// User typed-in array of characters:
	searchTerm: [],
	// Index of the user-selected emoji from the
	// list of suggestions for the search term:
	selectedSuggestionIndex: 0,
	// Resulting emoji:
	emoji: null,
	// Memoized selector for this query instance:
	suggestedEmoji: selectSuggestedEmojiForQuery(),
};

export default function reducer(state = initialState, action) {
	switch (action.type) {
		// A character is being typed:
		case ADD_CHARACTER:
			// Ignore subsequent spaces:
			if (action.character === ' ' && state.searchTerm[state.searchTerm.length - 1] === action.character) {
				return state;
			}
			// Update search term and reset selection:
			return {
				...state,
				searchTerm: [...state.searchTerm, action.character],
				selectedSuggestionIndex: 0,
			};
		// The last character of the search term is being removed:
		case REMOVE_CHARACTER:
			// Update search term and reset selection:
			return {
				...state,
				searchTerm: state.searchTerm.slice(0, -1),
				selectedSuggestionIndex: 0,
			};
		// Next suggestion is being selected:
		case SELECT_NEXT_SUGGESTION: {
			const index = restrictSelectedSuggestionIndex(state, state.selectedSuggestionIndex + 1);
			return {
				...state,
				selectedSuggestionIndex: index,
			};
		}
		// Previous suggestion is being selected:
		case SELECT_PREVIOUS_SUGGESTION: {
			const index = restrictSelectedSuggestionIndex(state, state.selectedSuggestionIndex - 1);
			return {
				...state,
				selectedSuggestionIndex: index,
			};
		}
		// Submit emoji based on inputted search term and selected suggestion:
		case SUBMIT: {
			if (state.searchTerm.length > 0) {
				// Memoize visual representation of selected emoji:
				const suggestions = state.suggestedEmoji(state); // memoized
				const emoji = suggestions.length ? suggestions[state.selectedSuggestionIndex].output : null;
				return { ...state, emoji };
			}
			return state;
		}
		default:
			return state;
	}
}
