// input selectors

const { createSelector } = require('reselect');
const chalk = require('chalk');

const selectPrompt = state => state.input.prompt;
const selectPlaceholder = state => state.input.placeholder;
const selectCurrentSequenceElement = state => state.input.sequence[0];

const selectCurrentQuery = createSelector(
	selectCurrentSequenceElement,
	sequenceElement => sequenceElement.query
);

const selectStyledInput = createSelector(
	selectPrompt,
	selectPlaceholder,
	selectCurrentQuery,
	(prompt, placeholder, query) => {
		const styledPrompt = chalk.bold.yellow(prompt);
		const styledPlaceholder = chalk.dim(placeholder);
		const styledQuery = chalk.bold.yellow(query.join(''));
		const styledText = query.length > 0 ? styledQuery : styledPlaceholder
		return `${styledPrompt} ${styledText}`;
	}
);

module.exports = {
	selectStyledInput,
};
