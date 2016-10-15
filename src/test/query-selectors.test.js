import {
	selectSearchTermForQuery,
	createSelectSuggestedEmojiForQuery,
} from '../query-selectors';

describe('query-selectors', () => {
	it('should select the string representation of the search term array', () => {
		let state = { searchTerm: [] };
		expect(selectSearchTermForQuery(state)).to.deep.equal('');
		state = { searchTerm: ['u', 'n', 'i', 'c', 'o', 'r', 'n'] };
		expect(selectSearchTermForQuery(state)).to.deep.equal('unicorn');
	});

	it('should select a list of suggested emoji that match the search term', () => {
		const data = [
			{
				search: 'unicorn',
				output: '🦄',
			},
		];
		const selectSuggestedEmojiForQuery = createSelectSuggestedEmojiForQuery(); // create memoized selector
		let state = { searchTerm: [] };
		expect(selectSuggestedEmojiForQuery(state, data)).to.deep.equal([]);
		state = { searchTerm: ['u', 'n', 'i', 'c', 'o', 'r', 'n'] };
		expect(selectSuggestedEmojiForQuery(state, data)).to.deep.equal(data);
		expect(selectSuggestedEmojiForQuery(state, data)).to.deep.equal(data); // memoized result
	});
});
