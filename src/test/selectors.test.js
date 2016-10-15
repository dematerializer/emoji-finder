import chalk from 'chalk';
import { internals } from '../selectors';
import { createSelectSuggestedEmojiForQuery } from '../query-selectors';

const {
	selectData,
	selectQueries,
	selectCurrentQuery,
	selectCurrentQuerySearchTerm,
	selectCurrentQuerySelectedSuggestionIndex,
	selectSubmittedEmoji,
	selectSuggestedEmoji,
} = internals;

describe('selectors', () => {
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
				output: '🦄',
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
			currentQuery.selectedSuggestionIndex
		);
		expect(suggestedEmoji).to.deep.equal([
			chalk.underline.yellow('🦄' + ' '), // eslint-disable-line no-useless-concat
			'💩' + ' ', // eslint-disable-line no-useless-concat
		]);
	});
});
