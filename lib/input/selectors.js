// input selectors

const { createSelector } = require('reselect');
const chalk = require('chalk');

const selectPrompt = state => state.input.prompt;
const selectPlaceholder = state => state.input.placeholder;
const selectItems = state => state.input.items;

const selectCurrentItem = createSelector(
	selectItems,
	items => items[items.length - 1]
);

const selectCurrentQuery = createSelector(
	selectCurrentItem,
	item => item.query
);

const selectEmojiResults = createSelector(
	selectItems,
	items => items
		.map(item => item.emoji != null ? item.emoji : null)
		.filter(emoji => emoji != null)
);

const selectStyledInput = createSelector(
	selectPrompt,
	selectPlaceholder,
	selectCurrentQuery,
	selectEmojiResults,
	(prompt, placeholder, query, emojis) => {
		const styledPrompt = chalk.bold.yellow(prompt);
		const styledPlaceholder = chalk.dim(placeholder);
		const styledQuery = chalk.bold.yellow(query.join(''));
		const styledText = query.length > 0 ? styledQuery : styledPlaceholder
		const styledEmojis = emojis.length > 0 ? (' ' + emojis.join('  ') + '  ') : ' ';
		return `${styledPrompt}${styledEmojis}${styledText}`;
	}
);

module.exports = {
	selectStyledInput,
};
