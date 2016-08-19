// utils

import emojis from 'emojigotchi-emojis';

export const findEmojis = (query) => emojis.filter(emoji => emoji.keywords.includes(query));
