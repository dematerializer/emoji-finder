// input selectors

import { createSelector } from 'reselect';
import chalk from 'chalk';
import { findEmojis } from '../utils';

const selectQueries = state => state.input.queries;
const selectSelectedSuggestionIndex = state => state.input.selectedSuggestionIndex;

const selectCurrentQuery = createSelector(
	selectQueries,
	queries => queries[queries.length - 1]
);

const selectSubmittedEmojis = createSelector(
	selectQueries,
	selectSelectedSuggestionIndex,
	(queries, selectedSuggestionIndex) => queries
		.filter((query, index) => index < queries.length - 1)
		.map(query => {
			const queryStr = query.slice(0, -1).join('');
			const querySuggestionIndex = parseInt(query[query.length - 1], 10);
			const results = findEmojis(queryStr); // make somehow memoized?!
			const emoji = results.length ? results[querySuggestionIndex].chars : null;
			return emoji;
		})
		.filter(emoji => emoji != null)
);

const selectPlaceholder = createSelector(
	selectSubmittedEmojis,
	(submittedEmojis) => submittedEmojis.length > 0 ? '⏎ submit, ⌫  edit or start typing...' : 'start typing...'
);

const selectSuggestedEmojis = createSelector(
	selectCurrentQuery,
	selectSelectedSuggestionIndex,
	(query, selectedSuggestionIndex) =>
		findEmojis(query.join(''))
		.map((result, index) =>
			(index === selectedSuggestionIndex) ? chalk.bgRed(result.chars + ' ') : result.chars + ' ').slice(0, 7) // TODO: extract 7
);

const selectStyledInput = createSelector(
	selectSubmittedEmojis,
	selectCurrentQuery,
	selectPlaceholder,
	selectSuggestedEmojis,
	(submittedEmojis, currentQuery, placeholder, suggestedEmojis) => {
		const styledSubmittedEmojis = submittedEmojis.length > 0 ? (' ' + submittedEmojis.join('  ') + '  ') : '';
		const styledPrompt = chalk.bold.yellow('›');
		const styledCurrentQuery = chalk.bold.yellow(currentQuery.join(''));
		const styledPlaceholder = chalk.dim(placeholder);
		const styledText = currentQuery.length > 0 ? styledCurrentQuery : styledPlaceholder;
		const styledSuggestedEmojis = suggestedEmojis.join('  ');
		return `${styledSubmittedEmojis}${styledPrompt} ${styledText}\n${styledSuggestedEmojis}`;
	}
);

module.exports = {
	selectStyledInput,
};
