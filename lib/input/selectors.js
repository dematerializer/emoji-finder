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

const selectStyledInput = createSelector(
	selectSubmittedEmojis,
	selectCurrentQuery,
	selectPlaceholder,
	(submittedEmojis, currentQuery, placeholder) => {
		const styledSubmittedEmojis = submittedEmojis.length > 0 ? (' ' + submittedEmojis.join('  ') + '  ') : '';
		const styledPrompt = chalk.bold.yellow('›');
		const styledCurrentQuery = chalk.bold.yellow(currentQuery.join(''));
		const styledPlaceholder = chalk.dim(placeholder);
		const styledText = currentQuery.length > 0 ? styledCurrentQuery : styledPlaceholder;
		return `${styledSubmittedEmojis}${styledPrompt} ${styledText}`;
	}
);

module.exports = {
	selectStyledInput,
};
