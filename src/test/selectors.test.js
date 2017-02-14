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
	selectPreviousQuery,
	selectNextQuery,
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
	selectSelectedSuggestedEmojiDescription,
	selectHistory,
	selectPositionInHistory,
	selectCanSelectPreviousQuery,
	selectCanSelectNextQuery,
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

	it('should select the description of the currently selected suggested emoji', () => {
		const data = [
			{
				search: 'poop',
				output: '💩',
				tts: 'pile of poop',
				keywords: ['poop, dung'],
			},
		];
		const currentQuery = {
			searchTerm: ['p', 'o', 'o'],
			selectedSuggestionIndex: 0,
			suggestedEmoji: createSelectSuggestedEmojiForQuery(),
		};
		const selectedSuggestedEmojiDescription = selectSelectedSuggestedEmojiDescription.resultFunc(
			data,
			currentQuery,
			currentQuery.selectedSuggestionIndex,
		);
		expect(selectedSuggestedEmojiDescription).to.equal('pile of poop [poop, dung]');
	});

	it('should select history', () => {
		const state = {
			input: {
				history: [1, 2, 3],
			},
		};
		expect(selectHistory(state)).to.equal(state.input.history);
	});

	it('should select position in history', () => {
		const state = {
			input: {
				positionInHistory: 10,
			},
		};
		expect(selectPositionInHistory(state)).to.equal(10);
	});

	it('should select whether a previous query can be selected from history', () => {
		expect(selectCanSelectPreviousQuery({
			input: { history: [], positionInHistory: -1 },
		})).to.equal(false);
		expect(selectCanSelectPreviousQuery({
			input: { history: [1, 2, 3], positionInHistory: -1 },
		})).to.equal(true);
		expect(selectCanSelectPreviousQuery({
			input: { history: [1, 2, 3], positionInHistory: 0 },
		})).to.equal(true);
		expect(selectCanSelectPreviousQuery({
			input: { history: [1, 2, 3], positionInHistory: 1 },
		})).to.equal(true);
		expect(selectCanSelectPreviousQuery({
			input: { history: [1, 2, 3], positionInHistory: 2 },
		})).to.equal(false);
	});

	it('should select whether a next query can be selected from history', () => {
		expect(selectCanSelectNextQuery({
			input: { history: [], positionInHistory: -1 },
		})).to.equal(false);
		expect(selectCanSelectNextQuery({
			input: { history: [1, 2, 3], positionInHistory: -1 },
		})).to.equal(false);
		expect(selectCanSelectNextQuery({
			input: { history: [1, 2, 3], positionInHistory: 0 },
		})).to.equal(true);
		expect(selectCanSelectNextQuery({
			input: { history: [1, 2, 3], positionInHistory: 1 },
		})).to.equal(true);
		expect(selectCanSelectNextQuery({
			input: { history: [1, 2, 3], positionInHistory: 2 },
		})).to.equal(true);
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
			{
				search: 'unicorn',
				output: '🦄', // this is a real unicorn
			},
		];
		store.dispatch(setData(mockData));
		const output = () => stripAnsi(selectStyledInput(store.getState()));

		// Initial state:
		expect(output()).to.equal('› █ \n\n');

		// Start typing a matching search term:
		store.dispatch(addCharacter('p'));
		expect(output()).to.equal('› p█ ⌫ , ⇄ ⏎\n🦄   💩 \n ');

		// Select real poop:
		store.dispatch(selectNextSuggestion());
		expect(output()).to.equal('› p█ ⌫ , ⇄ ⏎\n🦄   💩 \n '); // 💩 underlined, but not shown here because we stripped ansi

		// Submit poop:
		store.dispatch(submit());
		expect(output()).to.equal('💩  › █ ⌫ , ⏎ , ↑\n\n');

		// Type search term with no, absolutely no match:
		'nono'.split('').forEach(character => store.dispatch(addCharacter(character)));
		expect(output()).to.equal('💩  › nono█ ⌫ , ↑\n\n');

		// Start over and type a search term that yields only one suggested emoji:
		'nono'.split('').forEach(() => store.dispatch(removeCharacter()));
		'poop'.split('').forEach(character => store.dispatch(addCharacter(character)));
		expect(output()).to.equal('💩  › poop█ ⌫ , ⏎ , ↑\n💩 \n ');

		// Submit poop again:
		store.dispatch(submit());
		expect(output()).to.equal('💩  💩  › █ ⌫ , ⏎ , ↑\n\n');

		// Submit unicorn:
		'unicorn'.split('').forEach(character => store.dispatch(addCharacter(character)));
		store.dispatch(submit());
		expect(output()).to.equal('💩  💩  🦄  › █ ⌫ , ⏎ , ↑\n\n');

		// Go back in history:
		store.dispatch(selectPreviousQuery());
		expect(output()).to.equal('💩  💩  🦄  › unicorn█ ⌫ , ⏎ , ↑↓\n🦄 \n ');

		// Go back in history until the end:
		store.dispatch(selectPreviousQuery());
		store.dispatch(selectPreviousQuery());
		expect(output()).to.equal('💩  💩  🦄  › p█ ⌫ , ⇄ ⏎ , ↓\n🦄   💩 \n ');

		// Delete everything and go forward in history until present:
		[...Array(100).keys()].forEach(() => store.dispatch(removeCharacter()));
		[...Array(100).keys()].forEach(() => store.dispatch(selectNextQuery()));
		expect(output()).to.equal('› █  ↑\n\n');
	});
});
