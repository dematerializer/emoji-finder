// utils

import Fuse from 'fuse.js';
import emojis from 'unicode-emoji-data';

const fuseOptions = {
	caseSensitive: false,
	shouldSort: true,
	tokenize: false,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 10,
	keys: [
		'name',
	],
};

const fuse = new Fuse(emojis, fuseOptions);

export const findEmojis = (query) => {
	if (query.trim().length === 0) {
		return [];
	}
	return fuse.search(query);
}
