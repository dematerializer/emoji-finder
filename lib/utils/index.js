// utils

import fuzzy from 'fuzzy';
import emojis from 'emojigotchi-emojis';

const fuzzyOptions = {
	extract: (el) => el.keywords
};

export const findEmojis = (query) => {
	if (query.trim().length === 0) {
		return [];
	}
	return fuzzy.filter(query, emojis, fuzzyOptions).map(el => el.original);
}
