// input reducer

import copyPaste from 'copy-paste';
import logUpdate from 'log-update';
import chalk from 'chalk';

import {
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	SELECT_SUGGESTION_LEFT,
	SELECT_SUGGESTION_RIGHT,
	SUBMIT,
} from './constants';
import queryReducer from './query-reducer';

const initialState = {
	queries: [ // user typed-in queries each resulting in an single emoji
		queryReducer(undefined, { type: 'INIT'}), // first query to start with
	],
};

const selectCurrentQuery = (state) => state.queries[state.queries.length - 1];

export default function (state = initialState, action) {
	switch (action.type) {
		case ADD_CHARACTER: {
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					(query === currentQuery) ? queryReducer(currentQuery, action) : query
				),
			};
		}
		case REMOVE_CHARACTER: {
			const currentQuery = selectCurrentQuery(state);
			if (currentQuery.searchTerm.length === 0 && state.queries.length > 1) {
				return {
					...state,
					queries: state.queries.slice(0, -1),
				};
			} else {
				return {
					...state,
					queries: state.queries.map(query =>
						(query === currentQuery) ? queryReducer(currentQuery, action) : query
					),
				};
			}
		}
		case SELECT_SUGGESTION_LEFT: {
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					(query === currentQuery) ? queryReducer(currentQuery, action) : query
				),
			};
		}
		case SELECT_SUGGESTION_RIGHT: {
			const currentQuery = selectCurrentQuery(state);
			return {
				...state,
				queries: state.queries.map(query =>
					(query === currentQuery) ? queryReducer(currentQuery, action) : query
				),
			};
		}
		case SUBMIT: {
			const currentQuery = selectCurrentQuery(state);
			const searchTermLength = currentQuery.searchTerm.join('').length;
			if (searchTermLength > 0 && currentQuery.suggestedEmojis(currentQuery).length > 0) {
				const updatedQueries = state.queries.map(query =>
					(query === currentQuery) ? queryReducer(currentQuery, action) : query
				);
				return {
					...state,
					queries: [ ...updatedQueries, queryReducer(undefined, { type: 'INIT' }) ],
				};
			} else if (state.queries.some(q => q.emoji != null)) {
				const result = state.queries.filter(q => q.emoji != null).map(q => q.emoji).join('');
				copyPaste.copy(result);
				logUpdate(chalk.yellow('💾 📋 ✓'));
				logUpdate.done();
				process.exit(0);
				return initialState;
			}
			return state;
		}
		default:
			return state;
	}
}
