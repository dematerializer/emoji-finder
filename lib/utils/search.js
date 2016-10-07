// search

import { filter } from 'fuzzaldrin';
import emoji from 'unicode-emoji-data/lib/emoji.expanded.json';
import annotations from 'unicode-emoji-data/lib/annotations/cldr/en.json';

const matchAnyVariationSelectorOrModifier = /\s(FE0E|FE0F|1F3FB|1F3FC|1F3FD|1F3FE|1F3FF)/g;

const annotationForSequence = annotations.reduce((annotationForSeq, annotation) => {
	const extAnnotationForSeq = annotationForSeq;
	extAnnotationForSeq[annotation.sequence] = annotation;
	return extAnnotationForSeq;
}, {});

const annotatedEmoji = emoji.map((datum) => {
	const normalizedSequence = datum.sequence.replace(matchAnyVariationSelectorOrModifier, '');
	const annotation = annotationForSequence[normalizedSequence];
	return {
		search: annotation == null ? undefined : `${annotation.tts} ${annotation.keywords.join(' ')}`,
		...datum,
	}
}).filter(datum => datum.search != null);

export const findEmoji = (query) => {
	if (query.trim().length === 0) {
		return [];
	}
	return filter(annotatedEmoji, query, { key: 'search' });
}
