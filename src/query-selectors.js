// query selectors

import { createSelector } from 'reselect';
import findEmoji from './search';
import { MAX_RESULTS } from './constants';

// Returns the query search term as a string:
export const selectSearchTerm = state => state.searchTerm.join('');

// Creates a memoized selector that returns a list
// of suggested emoji that match the search term:
export const createSelectSuggestedEmojiForQuery = () => createSelector(
	selectSearchTerm,
	searchTerm => findEmoji(searchTerm).slice(0, MAX_RESULTS)
);
