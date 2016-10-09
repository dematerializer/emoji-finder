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

const selectSubmittedEmoji = createSelector(
	selectQueries,
	queries => queries
		.map(query => query.emoji)
		.filter((query, index) => index < queries.length - 1) // last query is never submitted
);

const selectPlaceholder = createSelector(
	selectSubmittedEmoji,
	submittedEmoji => submittedEmoji.length > 0 ? '⌫ , ⏎' : ''
);

const selectSuggestedEmoji = createSelector(
	selectCurrentQuery,
	selectCurrentQuerySelectedSuggestionIndex,
	(currentQuery, selectedSuggestionIndex) =>
		currentQuery.suggestedEmoji(currentQuery) // need to pass in the query state explicitly
		.map((result, index) => {
			const unselectedEmoji = result.output + ' ';
			const selectedEmoji = chalk.underline.yellow(unselectedEmoji);
			return (index === selectedSuggestionIndex) ? selectedEmoji : unselectedEmoji;
		})
		.slice(0, 7) // TODO: extract 7
);

const selectStyledInput = createSelector(
	selectSubmittedEmoji,
	selectCurrentQuerySearchTerm,
	selectPlaceholder,
	selectSuggestedEmoji,
	(submittedEmoji, currentQuerySearchTerm, placeholder, suggestedEmoji) => {
		const styledSubmittedEmoji = submittedEmoji.length > 0 ? (submittedEmoji.join('  ') + '  ') : '';
		const styledPrompt = chalk.bold.yellow('›');
		const styledCurrentQuerySearchTerm = chalk.bold.yellow(currentQuerySearchTerm);
		const styledPlaceholder = chalk.dim(placeholder);
		const styledText = styledCurrentQuerySearchTerm.length > 0 ? styledCurrentQuerySearchTerm : styledPlaceholder;
		let styledCursor = chalk.bold.yellow('█');
		if (styledCurrentQuerySearchTerm.length > 0) {
			if (suggestedEmoji.length > 1) {
				styledCursor += chalk.dim(' ⌫ , ⇄ ⏎');
			} else if (suggestedEmoji.length < 1) {
				styledCursor += chalk.dim(' ⌫');
			} else {
				styledCursor += chalk.dim(' ⌫ , ⏎');
			}
		}
		const styledSuggestedEmoji = suggestedEmoji.join('  ');
		if (styledCurrentQuerySearchTerm.length > 0) {
			return `${styledSubmittedEmoji}${styledPrompt} ${styledText}${styledCursor}\n${styledSuggestedEmoji}`;
		}
		return `${styledSubmittedEmoji}${styledPrompt} ${styledCursor} ${styledText}\n${styledSuggestedEmoji}`;
	}
);

module.exports = {
	selectStyledInput,
};
