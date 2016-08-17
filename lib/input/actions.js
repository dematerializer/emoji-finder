// input actions

const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');

const addCharacter = character => ({
	type: ADD_CHARACTER,
	character,
});

const removeCharacter = () => ({
	type: REMOVE_CHARACTER,
});

const submit = () => ({
	type: SUBMIT,
});

module.exports = {
	addCharacter,
	removeCharacter,
	submit,
}
