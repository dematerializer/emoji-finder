// input selectors

import { createSelector } from 'reselect';
import chalk from 'chalk';

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
	selectCurrentQuery,
	selectEmojiResults,
	(query, emojis) => {
		const styledPrompt = chalk.bold.yellow('›');
		const styledPlaceholder = chalk.dim('start typing...');
		const styledQuery = chalk.bold.yellow(query.join(''));
		const styledText = query.length > 0 ? styledQuery : styledPlaceholder
		const styledEmojis = emojis.length > 0 ? (' ' + emojis.join('  ') + '  ') : ' ';
		return `${styledPrompt}${styledEmojis}${styledText}`;
	}
);

module.exports = {
	selectStyledInput,
};
