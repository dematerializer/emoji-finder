// input query reducer

import { createSelectSuggestedEmojiForQuery } from './query-selectors';
import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_NEXT_SUGGESTION,
	SELECT_PREVIOUS_SUGGESTION,
	SUBMIT,
} from './constants';

// Clamps a given value between (including) min and max, cycling if out of bounds:
const clamp = (index, min, max) => {
	let movedIndex = index;
	if (movedIndex > max) {
		movedIndex = min;
	} else if (movedIndex < min) {
		movedIndex = max;
	}
	return movedIndex;
};

export const internals = {
	clamp,
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
	suggestedEmoji: createSelectSuggestedEmojiForQuery(),
};

export default function reducer(state = initialState, action) {
	switch (action.type) {
		// A character is being added:
		case ADD_CHARACTER:
			// Ignore subsequent spaces:
			if (action.character === ' ' && state.searchTerm[state.searchTerm.length - 1] === action.character) {
				return state;
			}
			// Add character to search term and reset selected suggestion:
			return {
				...state,
				searchTerm: [...state.searchTerm, action.character],
				selectedSuggestionIndex: 0,
			};
		// The last added character is being removed:
		case REMOVE_CHARACTER:
			if (state.searchTerm.length === 0) {
				return state;
			}
			// Remove character from search term and reset selected suggestion:
			return {
				...state,
				searchTerm: state.searchTerm.slice(0, -1),
				selectedSuggestionIndex: 0,
			};
		// Next suggestion is being selected:
		case SELECT_NEXT_SUGGESTION: {
			const maxIndex = state.suggestedEmoji(state).length - 1; // memoized
			if (maxIndex === -1) { // skip when there are no suggestions
				return state;
			}
			const index = clamp(state.selectedSuggestionIndex + 1, 0, maxIndex);
			return {
				...state,
				selectedSuggestionIndex: index,
			};
		}
		// Previous suggestion is being selected:
		case SELECT_PREVIOUS_SUGGESTION: {
			const maxIndex = state.suggestedEmoji(state).length - 1; // memoized
			if (maxIndex === -1) { // skip when there are no suggestions
				return state;
			}
			const index = clamp(state.selectedSuggestionIndex - 1, 0, maxIndex);
			return {
				...state,
				selectedSuggestionIndex: index,
			};
		}
		// Selected emoji is being sumbitted:
		case SUBMIT: {
			const suggestions = state.suggestedEmoji(state); // memoized
			if (suggestions.length === 0) {
				return state;
			}
			// Memoize visual representation of selected emoji:
			return {
				...state,
				emoji: suggestions[state.selectedSuggestionIndex].output,
			};
		}
		default:
			return state;
	}
}
