import { takeEvery, takeLatest } from 'redux-saga';
import { select, put } from 'redux-saga/effects';
import logUpdate from 'log-update';
import copyPaste from 'copy-paste';
import chalk from 'chalk';
import 'isomorphic-fetch';
import punycode from 'punycode';
import leftPad from 'left-pad';

import {
	SUBMIT,
	ADD_CHARACTER,
	REMOVE_CHARACTER,
	MAX_RESULTS,
} from './constants';
import { setFindSuggestedEmoji } from './actions';
import {
	selectInput,
	selectQueries,
	selectCurrentQuerySearchTerm,
} from './selectors';

// Takes SUBMIT actions.
// If the input emoji sequence needs to be submitted,
// copy the sequence of emoji to the clipboard, print
// out a final message and exit the application:

function* copyEmojiSequenceAndExit() {
	const input = yield select(selectInput);
	if (!input.submitted) {
		return;
	}
	const queries = yield select(selectQueries);
	const emojiSequence = queries.filter(query => query.emoji != null).map(query => query.emoji).join('');
	copyPaste.copy(emojiSequence);
	logUpdate(chalk.yellow('💾 📋 ✓'));
	logUpdate.done();
	process.exit(0);
}

export function* inputEmojiSequenceSubmitted() {
	yield takeEvery(SUBMIT, copyEmojiSequenceAndExit);
}

const isAnnotationEqualToHexCode = (ann, seqHex) => {
	const { sequence, presentation = {} } = ann;
	const { default: defaultPresentation = '', variation = {} } = presentation;
	const { text = '', emoji = '' } = variation;

	return (
		sequence === seqHex ||
		defaultPresentation === seqHex ||
		text === seqHex ||
		emoji === seqHex
	);
};

// Takes ADD_CHARACTER, REMOVE_CHARACTER and SUBMIT actions.
// Tells the dango API to search emoji that match the current
// search term and annotates the results. It then creates a
// selector that returns a list of suggested emoji that match
// based on the the data provided by the dango API:
// Puts SET_FIND_SUGGESTED_EMOJI.

function* searchDango(annotations) {
	const currentQuerySearchTerm = yield select(selectCurrentQuerySearchTerm);
	if (currentQuerySearchTerm.length === 0) {
		yield put(setFindSuggestedEmoji(() => []));
		return;
	}
	const url = `https://emoji.getdango.com/api/emoji?q=${currentQuerySearchTerm}`;
	const data = yield fetch(url).then(res => res.json());
	const { results } = data;
	const suggestedEmoji = results.map((result) => {
		const seq = punycode.ucs2.decode(result.text);
		const seqHex = seq.map(cp => leftPad(cp.toString(16), 4, 0).toUpperCase()).join(' ');
		const annotation = annotations.find(ann =>
			isAnnotationEqualToHexCode(ann, seqHex),
		) || {
			output: '',
			tts: '',
			keywords: [''],
		};
		return {
			output: annotation.output,
			tts: annotation.tts,
			keywords: annotation.keywords,
		};
	}).slice(0, MAX_RESULTS);
	const selectSuggestedEmojiForQuery = () => suggestedEmoji; // ignore queryState
	// Override the accessor function for suggested emoji:
	yield put(setFindSuggestedEmoji(selectSuggestedEmojiForQuery));
}

export function* currentQueryChanged(annotations) {
	yield takeLatest([ADD_CHARACTER, REMOVE_CHARACTER, SUBMIT], searchDango, annotations);
}
