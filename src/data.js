import unicodeEmojiData from 'unicode-emoji-data';
import unicodeEmojiAnnotations from 'unicode-emoji-annotations';

const emoji = unicodeEmojiData.v4.expanded;
const annotations = unicodeEmojiAnnotations.combined('v30', 'en');

function groupArrayOfObjectsByKey(array, key) {
	return array.reduce((curr, obj) => {
		const next = curr;
		next[typeof key === 'function' ? key(obj) : obj[key]] = obj;
		return next;
	}, {});
}

// Convert array to object with sequence as key:
const annotationForSequence = groupArrayOfObjectsByKey(annotations, 'sequence');

const matchAnyVariationSelectorOrModifier = /\s(FE0E|FE0F|1F3FB|1F3FC|1F3FD|1F3FE|1F3FF)/g;

// Augment each emoji datum with a search string generated from it's annotation:
const annotatedEmoji = emoji.map((datum) => {
	const normalizedSequence = datum.sequence.replace(matchAnyVariationSelectorOrModifier, '');
	const annotationForNormalizedSequence = annotationForSequence[normalizedSequence];
	let search = datum.name; // fallback
	if (annotationForNormalizedSequence) {
		search = `${annotationForNormalizedSequence.tts} ${annotationForNormalizedSequence.keywords.join(' ')}`;
	}
	return {
		...datum,
		search,
	};
});

export default annotatedEmoji;
