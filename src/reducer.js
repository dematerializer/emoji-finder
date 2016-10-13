// input reducer

import copyPaste from 'copy-paste';
import logUpdate from 'log-update';
import chalk from 'chalk';

import queryReducer from './query-reducer';
import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_NEXT_SUGGESTION,
	SELECT_PREVIOUS_SUGGESTION,
	SUBMIT,
} from './constants';

// Returns the most recent query:
const selectCurrentQuery = state => state.queries[state.queries.length - 1];

// Export of internals used for testing:
export const internals = {
	selectCurrentQuery,
};

// Initial state of the input module:
const initialState = {
	// User typed-in queries each
	// resulting in an single emoji:
	queries: [
		// First empty query to start with:
		queryReducer(undefined, { type: 'INIT' }),
	],
};

export default function reducer(state = initialState, action) {
	switch (action.type) {
		// A character is being added:
		case ADD_CHARACTER: {
			// Let the current query handle the action
			// and update it's state with the new result:
			const currentQuery = selectCurrentQuery(state);
			return {
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query)
				),
			};
		}
		// The last added character is being removed:
		case REMOVE_CHARACTER: {
			// Remove the current query if there is no character left to be removed:
			const currentQuery = selectCurrentQuery(state);
			if (currentQuery.searchTerm.length === 0 && state.queries.length > 1) {
				return {
					queries: state.queries.slice(0, -1),
				};
			}
			// As long as there's a character in the current query's search term,
			// let it handle the action and update it's state with the new result:
			return {
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query)
				),
			};
		}
		// Next suggestion is being selected:
		case SELECT_NEXT_SUGGESTION: {
			// Let the current query handle the action
			// and update it's state with the new result:
			const currentQuery = selectCurrentQuery(state);
			return {
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query)
				),
			};
		}
		// Previous suggestion is being selected:
		case SELECT_PREVIOUS_SUGGESTION: {
			// Let the current query handle the action
			// and update it's state with the new result:
			const currentQuery = selectCurrentQuery(state);
			return {
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query)
				),
			};
		}
		// Selected single emoji or whole sequence is being submitted:
		case SUBMIT: {
			const currentQuery = selectCurrentQuery(state);
			const searchTermLength = currentQuery.searchTerm.join('').length;
			// Submit a single emoji:
			// If the current query's search term isn't empty,
			// let the query handle the action, update it's
			// state with the new result and initialize a new query:
			if (searchTermLength > 0 && currentQuery.suggestedEmoji(currentQuery).length > 0) {
				const updatedQueries = state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query)
				);
				return {
					queries: [...updatedQueries, queryReducer(undefined, { type: 'INIT' })],
				};
			// Submit the sequence of submitted emoji:
			// If at least one query contains a sumbitted emoji,
			// copy the sequence of emoji to the clipboard, print
			// out a final message and exit the application:
			} else if (state.queries.some(q => q.emoji != null)) {
				const result = state.queries.filter(q => q.emoji != null).map(q => q.emoji).join('');
				copyPaste.copy(result);
				logUpdate(chalk.yellow('💾 📋 ✓'));
				logUpdate.done();
				process.exit(0);
				// return initialState;
			}
			// istanbul ignore next
			return state;
		}
		default:
			return state;
	}
}
