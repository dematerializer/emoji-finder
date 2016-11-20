import stripAnsi from 'strip-ansi';
import { combineReducers, createStore } from 'redux';

import { internals } from '../selectors';
import { createSelectSuggestedEmojiForQuery } from '../query-selectors';

import inputReducer from '../reducer';
import {
	setData,
	addCharacter,
	removeCharacter,
	selectNextSuggestion,
	submit,
} from '../actions';

const {
	selectInput,
	selectData,
	selectQueries,
	selectCurrentQuery,
	selectCurrentQuerySearchTerm,
	selectCurrentQuerySelectedSuggestionIndex,
	selectSubmittedEmoji,
	selectSuggestedEmoji,
	selectStyledInput,
} = internals;

describe('selectors', () => {
	it('should select the input domain', () => {
		const state = {
			input: {},
		};
		expect(selectInput(state)).to.equal(state.input);
	});

	it('should select data', () => {
		const state = {
			input: {
				data: [1, 2, 3],
			},
		};
		expect(selectData(state)).to.equal(state.input.data);
	});

	it('should select queries', () => {
		const state = {
			input: {
				queries: [1, 2, 3],
			},
		};
		expect(selectQueries(state)).to.equal(state.input.queries);
	});

	it('should select the current query', () => {
		const queries = [1, 2, 3];
		expect(selectCurrentQuery.resultFunc(queries)).to.equal(3);
	});

	it('should select the search term of the current query', () => {
		const query = {
			searchTerm: ['p', 'o', 'o', 'p'],
		};
		expect(selectCurrentQuerySearchTerm.resultFunc(query)).to.equal('poop');
	});

	it('should select the selected suggestion index of the current query', () => {
		const query = {
			selectedSuggestionIndex: 5,
		};
		expect(selectCurrentQuerySelectedSuggestionIndex.resultFunc(query)).to.equal(5);
	});

	it('should select submitted emoji', () => {
		const queries = [
			{ emoji: '💩' },
			{ emoji: '🦄' },
			{ emoji: null },
		];
		expect(selectSubmittedEmoji.resultFunc(queries)).to.deep.equal(['💩', '🦄']);
	});

	it('should select suggested emoji', () => {
		const data = [
			{
				search: 'poop',
				output: '💩',
			},
			{
				search: 'poo',
				output: '🦄', // let's assume this is not a unicorn but a 'poony'
			},
		];
		const currentQuery = {
			searchTerm: ['p', 'o', 'o'],
			selectedSuggestionIndex: 0,
			suggestedEmoji: createSelectSuggestedEmojiForQuery(),
		};
		const suggestedEmoji = selectSuggestedEmoji.resultFunc(
			data,
			currentQuery,
			currentQuery.selectedSuggestionIndex,
		).map(emoji => stripAnsi(emoji));
		expect(suggestedEmoji).to.deep.equal([
			'🦄' + ' ', // eslint-disable-line no-useless-concat
			'💩' + ' ', // eslint-disable-line no-useless-concat
		]);
	});

	it('should select styled input', () => {
		const rootReducer = combineReducers({
			input: inputReducer,
		});
		const store = createStore(rootReducer);
		const mockData = [
			{
				search: 'poop',
				output: '💩',
			},
			{
				search: 'poo',
				output: '🦄', // let's assume this is not a unicorn but a 'poony'
			},
		];
		store.dispatch(setData(mockData));
		const output = () => stripAnsi(selectStyledInput(store.getState()));

		// Initial state:
		expect(output()).to.equal('› █ \n');

		// Start typing a matching search term:
		store.dispatch(addCharacter('p'));
		expect(output()).to.equal('› p█ ⌫ , ⇄ ⏎\n🦄   💩 ');

		// Select real poop:
		store.dispatch(selectNextSuggestion());
		expect(output()).to.equal('› p█ ⌫ , ⇄ ⏎\n🦄   💩 '); // 💩 underlined, but not shown here because we stripped ansi

		// Submit poop:
		store.dispatch(submit());
		expect(output()).to.equal('💩  › █ ⌫ , ⏎\n');

		// Type search term with no match:
		store.dispatch(addCharacter('n'));
		store.dispatch(addCharacter('o'));
		expect(output()).to.equal('💩  › no█ ⌫\n');

		// Start over and type a search term that yields only one suggested emoji:
		store.dispatch(removeCharacter());
		store.dispatch(removeCharacter());
		store.dispatch(addCharacter('p'));
		store.dispatch(addCharacter('o'));
		store.dispatch(addCharacter('o'));
		store.dispatch(addCharacter('p'));
		expect(output()).to.equal('💩  › poop█ ⌫ , ⏎\n💩 ');
	});
});
