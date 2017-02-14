import { expandEmojiData, emojiDataStable } from 'unicode-emoji-data';
import { combinedAnnotationsForLanguage } from 'unicode-emoji-annotations';
import punycode from 'punycode';

const emojiData = expandEmojiData(emojiDataStable);

function groupArrayOfObjectsByKey(array, key) {
	return array.reduce((curr, obj) => {
		const next = curr;
		next[typeof key === 'function' ? key(obj) : obj[key]] = obj;
		return next;
	}, {});
}

export default function getDataForLanguage(language) {
	const annotations = combinedAnnotationsForLanguage(language);
	const englishAnnotations = combinedAnnotationsForLanguage('en');

	// Convert array to object with sequence as key:
	const annotationForSequence = groupArrayOfObjectsByKey(annotations, 'sequence');
	const englishAnnotationForSequence = groupArrayOfObjectsByKey(englishAnnotations, 'sequence');

	const matchAnyVariationSelectorOrModifier = /\s(FE0E|FE0F|1F3FB|1F3FC|1F3FD|1F3FE|1F3FF)/g;

	// Augment each emoji datum with a search string generated from it's annotation:
	const annotatedEmoji = emojiData.map((datum) => {
		// Prefer explicit emoji presentation variation sequence:
		const outputSequence = datum.presentation.variation ? datum.presentation.variation.emoji : datum.presentation.default;
		const normalizedSequence = outputSequence.replace(matchAnyVariationSelectorOrModifier, '');
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
			...annotationForNormalizedSequence,
			output: punycode.ucs2.encode(outputSequence.split(' ').map(cp => parseInt(cp, 16))),
			search,
		};
	});
	return annotatedEmoji;
}
