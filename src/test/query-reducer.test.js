import reducer, { internals } from '../query-reducer';
import * as actions from '../actions';

const { clamp } = internals;

describe('query-reducer', () => {
	it('should clamp a given value between (including) min and max, cycling if out of bounds', () => {
		expect(clamp(-1, 0, 2)).to.equal(2);
		expect(clamp(0, 0, 2)).to.equal(0);
		expect(clamp(1, 0, 2)).to.equal(1);
		expect(clamp(2, 0, 2)).to.equal(2);
		expect(clamp(3, 0, 2)).to.equal(0);
	});

	it('should return the initial state', () => {
		const initialState = reducer(undefined, {});
		expect(initialState.searchTerm).to.deep.equal([]);
		expect(initialState.selectedSuggestionIndex).to.equal(0);
		expect(initialState.emoji).to.equal(null);
		expect(initialState.suggestedEmoji).to.be.a('function');
	});

	it('should add a character to the search term and reset the selected suggestion', () => {
		let stateBefore = { searchTerm: [], selectedSuggestionIndex: 1 };
		let stateAfter = reducer(stateBefore, actions.addCharacter('A'));
		let expectedState = { searchTerm: ['A'], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		stateBefore = { searchTerm: ['A'], selectedSuggestionIndex: 2 };
		stateAfter = reducer(stateBefore, actions.addCharacter('B'));
		expectedState = { searchTerm: ['A', 'B'], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		stateBefore = { searchTerm: ['A'], selectedSuggestionIndex: 3 };
		stateAfter = reducer(stateBefore, actions.addCharacter(' '));
		expectedState = { searchTerm: ['A', ' '], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		stateBefore = { searchTerm: ['A', ' '], selectedSuggestionIndex: 4 };
		stateAfter = reducer(stateBefore, actions.addCharacter(' '));
		expectedState = { searchTerm: ['A', ' '], selectedSuggestionIndex: 4 };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should remove the last added character from the search term and reset the selected suggestion', () => {
		let stateBefore = { searchTerm: [], selectedSuggestionIndex: 0 };
		let stateAfter = reducer(stateBefore, actions.removeCharacter());
		let expectedState = { searchTerm: [], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		stateBefore = { searchTerm: ['A'], selectedSuggestionIndex: 1, emoji: 'AA' };
		stateAfter = reducer(stateBefore, actions.removeCharacter());
		expectedState = { searchTerm: [], selectedSuggestionIndex: 0, emoji: null };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should select the next suggestion', () => {
		let suggestedEmoji = () => [1, 2, 3];
		let stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		let stateAfter = reducer(stateBefore, actions.selectNextSuggestion());
		let expectedState = { suggestedEmoji, selectedSuggestionIndex: 1 };
		expect(stateAfter).to.deep.equal(expectedState);

		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 2 };
		stateAfter = reducer(stateBefore, actions.selectNextSuggestion());
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		suggestedEmoji = () => [];
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.selectNextSuggestion());
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should select the previous suggestion', () => {
		let suggestedEmoji = () => [1, 2, 3];
		let stateBefore = { suggestedEmoji, selectedSuggestionIndex: 2 };
		let stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion());
		let expectedState = { suggestedEmoji, selectedSuggestionIndex: 1 };
		expect(stateAfter).to.deep.equal(expectedState);

		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion());
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 2 };
		expect(stateAfter).to.deep.equal(expectedState);

		suggestedEmoji = () => [];
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion());
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should submit the selected suggested emoji', () => {
		let suggestedEmoji = () => [
			{ output: 'A' },
			{ output: 'B' },
			{ output: 'C' },
		];
		let stateBefore = { suggestedEmoji, selectedSuggestionIndex: 2 };
		let stateAfter = reducer(stateBefore, actions.submit());
		let expectedState = { suggestedEmoji, selectedSuggestionIndex: 2, emoji: 'C' };
		expect(stateAfter).to.deep.equal(expectedState);

		suggestedEmoji = () => [];
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.submit());
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);
	});
});
