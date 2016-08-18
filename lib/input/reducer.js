// input reducer

const items = require('./item-reducer');
const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');

const initialState = {
	prompt: '›',
	placeholder: 'start typing',
	items: [items(undefined, { type: 'INITIAL' })],
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case ADD_CHARACTER:
		case REMOVE_CHARACTER:
		case SUBMIT:
			return Object.assign({}, state, {
				items: state.items.map((it, index) => {
					if (index === state.items.length - 1) {
						return items(it, action);
					}
					return it;
				}),
			});
		default:
			return state;
	}
};

module.exports = reducer;
