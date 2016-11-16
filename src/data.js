import unicodeEmojiData from 'unicode-emoji-data';
import unicodeEmojiAnnotations from 'unicode-emoji-annotations';

function groupArrayOfObjectsByKey(array, key) {
	return array.reduce((curr, obj) => {
		const next = curr;
		next[typeof key === 'function' ? key(obj) : obj[key]] = obj;
		return next;
	}, {});
}

export default function getDataForLanguage(language) {
	const emoji = unicodeEmojiData.v4.expanded;
	const annotations = unicodeEmojiAnnotations.combined('v30', language);
	const englishAnnotations = unicodeEmojiAnnotations.combined('v30', 'en');

	// Convert array to object with sequence as key:
	const annotationForSequence = groupArrayOfObjectsByKey(annotations, 'sequence');
	const englishAnnotationForSequence = groupArrayOfObjectsByKey(englishAnnotations, 'sequence');

	const matchAnyVariationSelectorOrModifier = /\s(FE0E|FE0F|1F3FB|1F3FC|1F3FD|1F3FE|1F3FF)/g;

	// Augment each emoji datum with a search string generated from it's annotation:
	const annotatedEmoji = emoji.map((datum) => {
		const normalizedSequence = datum.sequence.replace(matchAnyVariationSelectorOrModifier, '');
		const annotationForNormalizedSequence = annotationForSequence[normalizedSequence];
		const englishAnnotationForNormalizedSequence = englishAnnotationForSequence[normalizedSequence];
		let search = '';
		if (annotationForNormalizedSequence) {
			search = `${annotationForNormalizedSequence.tts} ${annotationForNormalizedSequence.keywords.join(' ')}`;
		} else if (englishAnnotationForNormalizedSequence) { // fallback
			search = `${englishAnnotationForNormalizedSequence.tts} ${englishAnnotationForNormalizedSequence.keywords.join(' ')}`;
		} else { // last resort fallback
			search = datum.name;
		}
		return {
			...datum,
			search,
		};
	});
	return annotatedEmoji;
}
