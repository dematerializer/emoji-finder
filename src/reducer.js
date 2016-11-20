import queryReducer from './query-reducer';
import {
	SET_DATA,
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_NEXT_SUGGESTION,
	SELECT_PREVIOUS_SUGGESTION,
	SUBMIT,
	RESET,
} from './constants';

// Returns the most recent query:
const selectCurrentQuery = state => state.queries[state.queries.length - 1];

// Export of internals used for testing:
export const internals = {
	selectCurrentQuery,
};

// Initial state of the input module:
const initialState = {
	// Emoji data to search:
	data: null,
	// User typed-in queries each
	// resulting in an single emoji:
	queries: [
		// First empty query to start with:
		queryReducer(undefined, { type: 'INIT' }),
	],
	// Sequence is submitted:
	submitted: false,
};

export default function reducer(state = initialState, action) {
	// Inoperable without data:
	if (action.type !== SET_DATA && state.data == null) {
		return state;
	}
	switch (action.type) {
		// Emoji data is being set:
		case SET_DATA: {
			return {
				...state,
				data: action.data,
			};
		}
		// A character is being added:
		case ADD_CHARACTER: {
			// Let the current query handle the action
			// and update it's state with the new result:
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action, state.data) : query),
				),
			};
		}
		// The last added character is being removed:
		case REMOVE_CHARACTER: {
			// Remove the current query if there is no character left to be removed:
			const currentQuery = selectCurrentQuery(state);
			if (currentQuery.searchTerm.length === 0 && state.queries.length > 1) {
				return {
					...state,
					queries: state.queries.slice(0, -1),
				};
			}
			// As long as there's a character in the current query's search term,
			// let it handle the action and update it's state with the new result:
			return {
				...state,
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action, state.data) : query),
				),
			};
		}
		// Next suggestion is being selected:
		case SELECT_NEXT_SUGGESTION: {
			// Let the current query handle the action
			// and update it's state with the new result:
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action, state.data) : query),
				),
			};
		}
		// Previous suggestion is being selected:
		case SELECT_PREVIOUS_SUGGESTION: {
			// Let the current query handle the action
			// and update it's state with the new result:
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action, state.data) : query),
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
			// istanbul ignore else
			if (searchTermLength > 0 && currentQuery.suggestedEmoji(currentQuery, state.data).length > 0) {
				const updatedQueries = state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action, state.data) : query),
				);
				return {
					...state,
					queries: [...updatedQueries, queryReducer(undefined, { type: 'INIT' })],
				};
			// Submit the sequence of submitted emoji:
			} else if (state.queries.some(q => q.emoji != null)) {
				return {
					...state,
					data: state.data,
					submitted: true,
				};
			}
			// istanbul ignore next
			return state;
		}
		// Reset everything but data:
		case RESET: {
			return {
				...initialState,
				data: state.data,
			};
		}
		default:
			return state;
	}
}
