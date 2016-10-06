// utils

import Fuse from 'fuse.js';
import emoji from 'unicode-emoji-data/lib/emoji.expanded.json';

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

const fuse = new Fuse(emoji, fuseOptions);

export const findEmoji = (query) => {
	if (query.trim().length === 0) {
		return [];
	}
	return fuse.search(query);
}
