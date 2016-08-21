// input selectors

import { createSelector } from 'reselect';
import chalk from 'chalk';

const selectQueries = state => state.input.queries;

const selectCurrentQuery = createSelector(
	selectQueries,
	queries => queries[queries.length - 1]
);

const selectCurrentQuerySearchTerm = createSelector(
	selectCurrentQuery,
	currentQuery => currentQuery.searchTerm.join('')
);

const selectCurrentQuerySelectedSuggestionIndex = createSelector(
	selectCurrentQuery,
	currentQuery => currentQuery.selectedSuggestionIndex
);

const selectSubmittedEmojis = createSelector(
	selectQueries,
	queries => queries
		.map(query => query.emoji)
		.filter((query, index) => index < queries.length - 1) // last query is never submitted
);

const selectPlaceholder = createSelector(
	selectSubmittedEmojis,
	submittedEmojis => submittedEmojis.length > 0 ? '⏎ submit, ⌫  edit or start typing...' : 'start typing...'
);

const selectSuggestedEmojis = createSelector(
	selectCurrentQuery,
	selectCurrentQuerySelectedSuggestionIndex,
	(currentQuery, selectedSuggestionIndex) =>
		currentQuery.suggestedEmojis(currentQuery)
		.map((result, index) => {
			const unselectedEmoji = result.chars + ' ';
			const selectedEmoji = chalk.underline.yellow(unselectedEmoji);
			return (index === selectedSuggestionIndex) ? selectedEmoji : unselectedEmoji;
		})
		.slice(0, 7) // TODO: extract 7
);

const selectStyledInput = createSelector(
	selectSubmittedEmojis,
	selectCurrentQuerySearchTerm,
	selectPlaceholder,
	selectSuggestedEmojis,
	(submittedEmojis, currentQuerySearchTerm, placeholder, suggestedEmojis) => {
		const styledSubmittedEmojis = submittedEmojis.length > 0 ? (' ' + submittedEmojis.join('  ') + '  ') : '';
		const styledPrompt = chalk.bold.yellow('›');
		const styledCurrentQuerySearchTerm = chalk.bold.yellow(currentQuerySearchTerm);
		const styledPlaceholder = chalk.dim(placeholder);
		const styledText = styledCurrentQuerySearchTerm.length > 0 ? styledCurrentQuerySearchTerm : styledPlaceholder;
		const styledSuggestedEmojis = suggestedEmojis.join('  ');
		return `${styledSubmittedEmojis}${styledPrompt} ${styledText}\n${styledSuggestedEmojis}`;
	}
);

module.exports = {
	selectStyledInput,
};
