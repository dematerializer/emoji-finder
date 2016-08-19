// input selectors

import { createSelector } from 'reselect';
import chalk from 'chalk';
import { findEmojis } from '../utils';

const selectQueries = state => state.input.queries;

const selectCurrentQuery = createSelector(
	selectQueries,
	queries => queries[queries.length - 1]
);

const selectSubmittedEmojis = createSelector(
	selectQueries,
	queries => queries
		.filter((query, index) => index < queries.length - 1)
		.map(query => {
			const results = findEmojis(query.join('')); // make somehow memoized?!
			const emoji = results.length ? results[0].chars : null;
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
	query => findEmojis(query.join('')).map(result => result.chars).slice(0, 7)
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
