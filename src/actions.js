import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_NEXT_SUGGESTION,
	SELECT_PREVIOUS_SUGGESTION,
	SUBMIT,
	RESET,
	SELECT_PREVIOUS_QUERY,
	SELECT_NEXT_QUERY,
	SET_FIND_SUGGESTED_EMOJI,
} from './constants';

export const addCharacter = character => ({
	type: ADD_CHARACTER,
	character,
});

export const removeCharacter = () => ({
	type: REMOVE_CHARACTER,
});

export const selectNextSuggestion = () => ({
	type: SELECT_NEXT_SUGGESTION,
});

export const selectPreviousSuggestion = () => ({
	type: SELECT_PREVIOUS_SUGGESTION,
});

export const submit = () => ({
	type: SUBMIT,
});

export const reset = () => ({
	type: RESET,
});

export const selectPreviousQuery = () => ({
	type: SELECT_PREVIOUS_QUERY,
});

export const selectNextQuery = () => ({
	type: SELECT_NEXT_QUERY,
});

export const setFindSuggestedEmoji = findSuggestedEmoji => ({
	type: SET_FIND_SUGGESTED_EMOJI,
	findSuggestedEmoji,
});
