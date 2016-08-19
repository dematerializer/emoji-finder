// input actions

import { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } from './constants';

export const addCharacter = character => ({
	type: ADD_CHARACTER,
	character,
});

export const removeCharacter = () => ({
	type: REMOVE_CHARACTER,
});

export const submit = () => ({
	type: SUBMIT,
});
