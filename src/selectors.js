import { createSelector } from 'reselect';
import chalk from 'chalk';

import { selectSearchTermForQuery } from './query-selectors';

const selectInput = state => state.input;
const selectQueries = state => state.input.queries;

// Returns the most recent query:
const selectCurrentQuery = createSelector(
	selectQueries,
	queries => queries[queries.length - 1],
);

const selectCurrentQuerySearchTerm = createSelector(
	selectCurrentQuery,
	currentQuery => selectSearchTermForQuery(currentQuery),
);

const selectCurrentQuerySelectedSuggestionIndex = createSelector(
	selectCurrentQuery,
	currentQuery => currentQuery.selectedSuggestionIndex,
);

const selectSubmittedEmoji = createSelector(
	selectQueries,
	queries => queries
		.map(query => query.emoji)
		.filter((query, index) => index < queries.length - 1), // last query is never submitted
);

const selectSuggestedEmoji = createSelector(
	selectCurrentQuery,
	selectCurrentQuerySelectedSuggestionIndex,
	(currentQuery, selectedSuggestionIndex) =>
		currentQuery.findSuggestedEmoji(currentQuery) // need to pass in the query state explicitly
		.map((result, index) => {
			const unselectedEmoji = `${result.output} `;
			const selectedEmoji = chalk.underline.yellow(unselectedEmoji);
			return (index === selectedSuggestionIndex) ? selectedEmoji : unselectedEmoji;
		}),
);

const selectSelectedSuggestedEmojiDescription = createSelector(
	selectCurrentQuery,
	selectCurrentQuerySelectedSuggestionIndex,
	(currentQuery, selectedSuggestionIndex) => {
		const suggestedEmoji = currentQuery.findSuggestedEmoji(currentQuery); // need to pass in the query state explicitly
		const selectedSuggestedEmoji = suggestedEmoji[selectedSuggestionIndex];
		if (selectedSuggestedEmoji == null) {
			return '';
		}
		const tts = selectedSuggestedEmoji.tts || '';
		const keywords = selectedSuggestedEmoji.keywords ? `[${selectedSuggestedEmoji.keywords.join(', ')}]` : '';
		return `${tts} ${keywords}`;
	},
);

const selectHistory = state => state.input.history;
const selectPositionInHistory = state => state.input.positionInHistory;

const selectCanSelectPreviousQuery = createSelector(
	selectHistory,
	selectPositionInHistory,
	(history, positionInHistory) => positionInHistory < history.length - 1,
);

const selectCanSelectNextQuery = createSelector(
	selectHistory,
	selectPositionInHistory,
	(history, positionInHistory) => positionInHistory > -1,
);

const selectStyledInput = createSelector(
	selectSubmittedEmoji,
	selectCurrentQuerySearchTerm,
	selectSuggestedEmoji,
	selectSelectedSuggestedEmojiDescription,
	selectHistory,
	selectCanSelectPreviousQuery,
	selectCanSelectNextQuery,
	(submittedEmoji, currentQuerySearchTerm, suggestedEmoji, selectedSuggestedEmojiDescription,
	history, canSelectPreviousQuery, canSelectNextQuery) => {
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
		let styledHistory = '';
		if (history.length > 0) {
			// istanbul ignore else
			if (canSelectPreviousQuery && canSelectNextQuery) {
				styledHistory = chalk.dim(' , ↑↓');
			} else if (canSelectPreviousQuery) {
				styledHistory = chalk.dim(styledText.length > 0 ? ' , ↑' : '↑');
			} else if (canSelectNextQuery) {
				styledHistory = chalk.dim(' , ↓');
			}
		}
		const styledSuggestedEmoji = suggestedEmoji.join('  ');
		if (styledCurrentQuerySearchTerm.length > 0) {
			return `${styledSubmittedEmoji}${styledPrompt} ${styledText}${styledCursor}${styledHistory}\n${styledSuggestedEmoji}\n${selectedSuggestedEmojiDescription}`;
		}
		return `${styledSubmittedEmoji}${styledPrompt} ${styledCursor} ${styledText}${styledHistory}\n${styledSuggestedEmoji}\n${selectedSuggestedEmojiDescription}`;
	},
);

// Export of internals used for testing:
export const internals = {
	selectInput,
	selectQueries,
	selectCurrentQuery,
	selectCurrentQuerySearchTerm,
	selectCurrentQuerySelectedSuggestionIndex,
	selectSubmittedEmoji,
	selectSuggestedEmoji,
	selectSelectedSuggestedEmojiDescription,
	selectHistory,
	selectPositionInHistory,
	selectCanSelectPreviousQuery,
	selectCanSelectNextQuery,
	selectStyledInput,
};

export {
	selectInput,
	selectQueries,
	selectCurrentQuerySearchTerm,
	selectStyledInput,
};
