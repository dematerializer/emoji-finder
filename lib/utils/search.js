// search

import { filter } from 'fuzzaldrin';
import emoji from 'unicode-emoji-data/lib/emoji.expanded.json';
import cldrAnnotations from 'unicode-emoji-data/lib/annotations/cldr/de.json';
import communityAnnotations from 'unicode-emoji-data/lib/annotations/community/de.json';
import universalCommunityAnnotations from 'unicode-emoji-data/lib/annotations/community/_universal.json';

const annotationsForSequence = [
	cldrAnnotations,
	communityAnnotations,
	universalCommunityAnnotations,
].map((annotations) =>
	annotations.reduce((annotationForSequence, annotation) => {
		const extAnnotationForSequence = annotationForSequence;
		extAnnotationForSequence[annotation.sequence] = annotation;
		return extAnnotationForSequence;
	}, {})
);

const matchAnyVariationSelectorOrModifier = /\s(FE0E|FE0F|1F3FB|1F3FC|1F3FD|1F3FE|1F3FF)/g;

const annotatedEmoji = emoji.map((datum) => {
	const normalizedSequence = datum.sequence.replace(matchAnyVariationSelectorOrModifier, '');
	const annotationsForNormalizedSequence = annotationsForSequence.map(annotationForSequence =>
		annotationForSequence[normalizedSequence]
	);
	const combinedAnnotation = annotationsForNormalizedSequence.reduce((combined, current) => {
		if (current != null) {
			combined.tts = combined.tts.concat(current.tts || []);
			combined.keywords = combined.keywords.concat(current.keywords || []);
		}
		return combined;
	}, {
		tts: [],
		keywords: [],
	});
	if (combinedAnnotation.tts.length === 0) {
		combinedAnnotation.tts = [datum.name];
	}
	return {
		search: `${combinedAnnotation.tts.join(' ')} ${combinedAnnotation.keywords.join(' ')}`,
		...datum,
	}
}).filter(datum => datum.search != null);

export const findEmoji = (query) => {
	if (query.trim().length === 0) {
		return [];
	}
	return filter(annotatedEmoji, query, { key: 'search' });
}
