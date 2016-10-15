// input selectors

import { createSelector } from 'reselect';
import chalk from 'chalk';

import { selectSearchTermForQuery } from './query-selectors';

const selectInput = state => state.input;
const selectData = state => state.input.data;
const selectQueries = state => state.input.queries;

// Returns the most recent query:
const selectCurrentQuery = createSelector(
	selectQueries,
	queries => queries[queries.length - 1]
);

const selectCurrentQuerySearchTerm = createSelector(
	selectCurrentQuery,
	currentQuery => selectSearchTermForQuery(currentQuery)
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

const selectSuggestedEmoji = createSelector(
	selectData,
	selectCurrentQuery,
	selectCurrentQuerySelectedSuggestionIndex,
	(data, currentQuery, selectedSuggestionIndex) =>
		currentQuery.suggestedEmoji(currentQuery, data) // need to pass in the query state and data explicitly
		.map((result, index) => {
			const unselectedEmoji = `${result.output} `;
			const selectedEmoji = chalk.underline.yellow(unselectedEmoji);
			return (index === selectedSuggestionIndex) ? selectedEmoji : unselectedEmoji;
		})
);

// istanbul ignore next
const selectStyledInput = createSelector(
	selectData,
	selectSubmittedEmoji,
	selectCurrentQuerySearchTerm,
	selectSuggestedEmoji,
	(data, submittedEmoji, currentQuerySearchTerm, suggestedEmoji) => {
		if (data == null) {
			return chalk.bold.red('no data');
		}
		const styledSubmittedEmoji = submittedEmoji.length > 0 ? (`${submittedEmoji.join('  ')}  `) : '';
		const styledPrompt = chalk.bold.yellow('›');
		const styledCurrentQuerySearchTerm = chalk.bold.yellow(currentQuerySearchTerm);
		const styledPlaceholder = chalk.dim(submittedEmoji.length > 0 ? '⌫ , ⏎' : '');
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

// Export of internals used for testing:
export const internals = {
	selectInput,
	selectData,
	selectQueries,
	selectCurrentQuery,
	selectCurrentQuerySearchTerm,
	selectCurrentQuerySelectedSuggestionIndex,
	selectSubmittedEmoji,
	selectSuggestedEmoji,
};

export {
	selectInput,
	selectQueries,
};

export default selectStyledInput;
