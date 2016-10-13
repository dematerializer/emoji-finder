import mock from 'mock-require';

// mock search.js required by query-selectors.js:
mock('../search', () => ['🦄']);
const {
	selectSearchTerm,
	createSelectSuggestedEmojiForQuery,
} = mock.reRequire('../query-selectors');

describe('query-selectors', () => {
	it('should select the string representation of the search term array', () => {
		let state = { searchTerm: [] };
		expect(selectSearchTerm(state)).to.deep.equal('');
		state = { searchTerm: ['u', 'n', 'i', 'c', 'o', 'r', 'n'] };
		expect(selectSearchTerm(state)).to.deep.equal('unicorn');
	});

	it('should select a list of suggested emoji that match the search term', () => {
		expect(createSelectSuggestedEmojiForQuery().resultFunc('unicorn')).to.deep.equal(['🦄']);
	});
});
