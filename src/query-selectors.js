// query selectors

import { filter } from 'fuzzaldrin';
import { MAX_RESULTS } from './constants';

// NOTE: These selectors are meant to be used directly on query state objects:

// For a given query state, returns the search term as a string:
export const selectSearchTermForQuery = queryState => queryState.searchTerm.join('');

// Creates a memoized selector for a given query state that
// returns a list of suggested emoji that match the search term:
export const createSelectSuggestedEmojiForQuery = () => {
	// reselect.createSelector cannot create parameterized selectors,
	// so we implement our own solution here in order to allow
	// search data to be passed in from the outside
	let lastSearchTerm = null;
	let memoizedSuggestedEmoji = null;
	return (queryState, data) => {
		const searchTerm = selectSearchTermForQuery(queryState);
		if (searchTerm === lastSearchTerm) {
			return memoizedSuggestedEmoji;
		}
		lastSearchTerm = searchTerm;
		if (searchTerm.length === 0) {
			memoizedSuggestedEmoji = [];
		} else {
			memoizedSuggestedEmoji = filter(data, searchTerm, { key: 'search' }).slice(0, MAX_RESULTS);
		}
		return memoizedSuggestedEmoji;
	};
};
