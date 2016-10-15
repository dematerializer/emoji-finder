// data

import emoji from 'unicode-emoji-data/lib/emoji.expanded.json';
import cldrAnnotations from 'unicode-emoji-data/lib/annotations/cldr/de.json';
import communityAnnotations from 'unicode-emoji-data/lib/annotations/community/de.json';
import universalCommunityAnnotations from 'unicode-emoji-data/lib/annotations/community/_universal.json';

// Convert arrays to objects with sequence as key:
const annotationsForSequence = [
	cldrAnnotations,
	communityAnnotations,
	universalCommunityAnnotations,
].map(annotations =>
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
		const extCombined = combined;
		if (current != null) {
			extCombined.tts = extCombined.tts.concat(current.tts || []);
			extCombined.keywords = extCombined.keywords.concat(current.keywords || []);
		}
		return extCombined;
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
	};
}).filter(datum => datum.search != null);

export default annotatedEmoji;
