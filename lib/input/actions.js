// input actions

import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_SUGGESTION_LEFT,
	SELECT_SUGGESTION_RIGHT,
	SUBMIT
} from './constants';

export const addCharacter = character => ({
	type: ADD_CHARACTER,
	character,
});

export const removeCharacter = () => ({
	type: REMOVE_CHARACTER,
});

export const selectSuggestionLeft = () => ({
	type: SELECT_SUGGESTION_LEFT,
});

export const selectSuggestionRight = () => ({
	type: SELECT_SUGGESTION_RIGHT,
});

export const submit = () => ({
	type: SUBMIT,
});
