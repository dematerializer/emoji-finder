import {
	SET_DATA,
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_NEXT_SUGGESTION,
	SELECT_PREVIOUS_SUGGESTION,
	SUBMIT,
	RESET,
} from './constants';

export const setData = data => ({
	type: SET_DATA,
	data,
});

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
