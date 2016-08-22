// utils

import Fuse from 'fuse.js';
import emojis from 'emojigotchi-data';

const transformedEmojis = emojis.map(emoji => ({
	...emoji,
	keywords: emoji.keywords.split(',').map(keyword => keyword.trim())
}));

const fuseOptions = {
	caseSensitive: false,
	shouldSort: true,
	tokenize: false,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 10,
	keys: [
		'keywords',
	],
};

const fuse = new Fuse(transformedEmojis, fuseOptions);

export const findEmojis = (query) => {
	if (query.trim().length === 0) {
		return [];
	}
	return fuse.search(query);
}
