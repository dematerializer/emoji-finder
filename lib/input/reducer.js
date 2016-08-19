// input reducer

const items = require('./item-reducer');
const { ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT } = require('./constants');

const initialState = {
	items: [items(undefined, { type: 'INITIAL' })],
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case ADD_CHARACTER: {
			return Object.assign({}, state, {
				items: state.items.map((it, index) => {
					if (index === state.items.length - 1) {
						return items(it, action);
					}
					return it;
				}),
			});
		}
		case REMOVE_CHARACTER: {
			let currentItem = state.items[state.items.length - 1];
			let updatedItem = items(currentItem, action);
			if (currentItem.query.length === 0 && state.items.length > 1) {
				updatedItems = state.items.slice(0, -1);
				currentItem = updatedItems[updatedItems.length - 1];
				updatedItem = Object.assign({}, currentItem, { emoji: null });
				updatedItems = updatedItems.map((it, index) => {
					if (index === updatedItems.length - 1) {
						return updatedItem;
					}
					return it;
				});
				return Object.assign({}, state, {
					items: updatedItems,
				});
			} else {
				return Object.assign({}, state, {
					items: state.items.map((it, index) => {
						if (index === state.items.length - 1) {
							return updatedItem;
						}
						return it;
					}),
				});
			}
		}
		case SUBMIT: {
			const currentItem = state.items[state.items.length - 1];
			const updatedItem = items(currentItem, action);
			if (updatedItem.emoji != null) {
				const newItem = items(undefined, { type: 'INITIAL' });
				const updatedItems = state.items.map((it, index) => {
					if (index === state.items.length - 1) {
						return updatedItem;
					}
					return it;
				});
				return Object.assign({}, state, {
					items: [ ...updatedItems, newItem ],
				});
			}
			return state;
		}
		default:
			return state;
	}
};

module.exports = reducer;
