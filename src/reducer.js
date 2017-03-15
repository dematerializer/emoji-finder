import queryReducer from './query-reducer';
import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_NEXT_SUGGESTION,
	SELECT_PREVIOUS_SUGGESTION,
	SUBMIT,
	RESET,
	SELECT_PREVIOUS_QUERY,
	SELECT_NEXT_QUERY,
	SET_FIND_SUGGESTED_EMOJI,
} from './constants';
import { setFindSuggestedEmoji } from './actions';

// Returns the most recent query:
const selectCurrentQuery = state => state.queries[state.queries.length - 1];

// Export of internals used for testing:
export const internals = {
	selectCurrentQuery,
};

const emptyResult = () => [];

// Initial state of the input module:
const initialState = {
	// User typed-in queries each
	// resulting in an single emoji:
	queries: [
		// First empty query to start with:
		queryReducer(undefined, { type: 'INIT' }),
	],
	// Sequence is submitted:
	submitted: false,
	// History of submitted queries:
	history: [],
	// Current position in the history:
	positionInHistory: -1,
	// Current selector function that selects a list
	// of suggested emoji that match the search term:
	findSuggestedEmoji: emptyResult, // initially empty
};

export default function reducer(state = initialState, action) {
	switch (action.type) {
		// A character is being added:
		case ADD_CHARACTER: {
			// Let the current query handle the action
			// and update it's state with the new result:
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query),
				),
				positionInHistory: -1,
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
					positionInHistory: -1,
				};
			}
			// As long as there's a character in the current query's search term,
			// let it handle the action and update it's state with the new result:
			return {
				...state,
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query),
				),
				positionInHistory: -1,
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
					((query === currentQuery) ? queryReducer(currentQuery, action) : query),
				),
				positionInHistory: -1,
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
					((query === currentQuery) ? queryReducer(currentQuery, action) : query),
				),
				positionInHistory: -1,
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
			if (searchTermLength > 0 && currentQuery.findSuggestedEmoji(currentQuery).length > 0) {
				const submittedQuery = queryReducer(currentQuery, action);
				const updatedQueries = state.queries.map(query =>
					((query === currentQuery) ? submittedQuery : query),
				);
				const addToHistory = // don't add subsequent identical query
					state.history.length === 0
					|| currentQuery.searchTerm.join('') !== state.history[0].searchTerm.join('')
					|| currentQuery.selectedSuggestionIndex !== state.history[0].selectedSuggestionIndex;
				return {
					...state,
					queries: [...updatedQueries, queryReducer(undefined, setFindSuggestedEmoji(state.findSuggestedEmoji))],
					history: addToHistory ? [currentQuery, ...state.history] : state.history,
					positionInHistory: -1,
				};
			// Submit the sequence of submitted emoji:
			} else if (state.queries.some(q => q.emoji != null)) {
				return {
					...state,
					submitted: true,
				};
			}
			// istanbul ignore next
			return state;
		}
		// Reset everything but history:
		case RESET: {
			return {
				...initialState,
				history: state.history,
				positionInHistory: state.positionInHistory,
			};
		}
		// Select previous query from history:
		case SELECT_PREVIOUS_QUERY: {
			const newIndexInHistory = Math.min(state.positionInHistory + 1, state.history.length - 1);
			if (newIndexInHistory === state.positionInHistory) {
				return state;
			}
			const currentQuery = selectCurrentQuery(state);
			const updatedQueries = state.queries.map(query =>
				((query === currentQuery) ? state.history[newIndexInHistory] : query),
			);
			return {
				...state,
				positionInHistory: newIndexInHistory,
				queries: updatedQueries,
			};
		}
		// Select next query from history:
		case SELECT_NEXT_QUERY: {
			const newIndexInHistory = Math.max(-1, state.positionInHistory - 1);
			if (newIndexInHistory === state.positionInHistory) {
				return state;
			}
			const currentQuery = selectCurrentQuery(state);
			let newCurrentQuery = null;
			if (newIndexInHistory > -1) {
				newCurrentQuery = state.history[newIndexInHistory];
			} else {
				newCurrentQuery = queryReducer(undefined, setFindSuggestedEmoji(emptyResult));
			}
			const updatedQueries = state.queries.map(query =>
				((query === currentQuery) ? newCurrentQuery : query),
			);
			return {
				...state,
				positionInHistory: newIndexInHistory,
				queries: updatedQueries,
			};
		}
		case SET_FIND_SUGGESTED_EMOJI: {
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				findSuggestedEmoji: action.findSuggestedEmoji,
				queries: state.queries.map(query =>
					((query === currentQuery) ? queryReducer(currentQuery, action) : query),
				),
				positionInHistory: -1,
			};
		}
		default:
			return state;
	}
}
