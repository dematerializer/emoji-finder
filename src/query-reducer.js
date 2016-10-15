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

// Export of internals used for testing:
export const internals = {
	clamp,
};

// Initial state of a newly created query:
const initialState = {
	// User typed-in array of characters:
	searchTerm: [],
	// Index of the user-selected emoji from the list
	// of suggestions that match the search term:
	selectedSuggestionIndex: 0,
	// Resulting 'submitted' emoji:
	emoji: null,
	// Memoized selector for this query instance that selects
	// a list of suggested emoji that match the search term:
	suggestedEmoji: createSelectSuggestedEmojiForQuery(),
};

// NOTE: For some actions this needs data from the input reducer
// to pass it on to the suggestedEmoji selector.

export default function reducer(state = initialState, action, data) {
	// Inoperable without data:
	if (data == null) {
		return state;
	}
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
				emoji: null, // also reset a previously submitted emoji
			};
		// Next suggestion is being selected:
		case SELECT_NEXT_SUGGESTION: {
			const numSuggestions = state.suggestedEmoji(state, data).length; // memoized
			if (numSuggestions === 0) { // skip when no suggestions
				return state;
			}
			const index = clamp(state.selectedSuggestionIndex + 1, 0, numSuggestions - 1);
			return {
				...state,
				selectedSuggestionIndex: index,
			};
		}
		// Previous suggestion is being selected:
		case SELECT_PREVIOUS_SUGGESTION: {
			const numSuggestions = state.suggestedEmoji(state, data).length; // memoized
			if (numSuggestions === 0) { // skip when no suggestions
				return state;
			}
			const index = clamp(state.selectedSuggestionIndex - 1, 0, numSuggestions - 1);
			return {
				...state,
				selectedSuggestionIndex: index,
			};
		}
		// Selected emoji is being submitted:
		case SUBMIT: {
			const suggestions = state.suggestedEmoji(state, data); // memoized
			if (suggestions.length === 0) {
				return state;
			}
			// Memorize ('submit') visual representation of selected emoji:
			return {
				...state,
				emoji: suggestions[state.selectedSuggestionIndex].output,
			};
		}
		default:
			return state;
	}
}
