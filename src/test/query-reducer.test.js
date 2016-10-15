import reducer, { internals } from '../query-reducer';
import * as actions from '../actions';

const { clamp } = internals;

const mockedData = [
	{
		search: 'unicorn',
		output: '🦄',
	},
];

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
		expect(initialState).to.have.all.keys('searchTerm', 'selectedSuggestionIndex', 'emoji', 'suggestedEmoji');
		expect(initialState.searchTerm).to.deep.equal([]);
		expect(initialState.selectedSuggestionIndex).to.equal(0);
		expect(initialState.emoji).to.equal(null);
		expect(initialState.suggestedEmoji).to.be.a('function');
	});

	it('should be inoperable if data is not passed to the reducer', () => {
		const stateBefore = { searchTerm: ['a'], selectedSuggestionIndex: 1 };
		expect(reducer(stateBefore, actions.addCharacter('b'))).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.removeCharacter())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.selectNextSuggestion())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.selectPreviousSuggestion())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.submit())).to.deep.equal(stateBefore);
	});

	it('should return the same state if the action is not recognized', () => {
		const stateBefore = { searchTerm: ['a'], selectedSuggestionIndex: 1 };
		expect(reducer(stateBefore, { type: 'SOME_UNSUPPORTED_ACTION' }, mockedData)).to.deep.equal(stateBefore);
	});

	it('should add a character to the search term and reset the selected suggestion', () => {
		// [] + 'A' = ['A']
		let stateBefore = { searchTerm: [], selectedSuggestionIndex: 1 };
		let stateAfter = reducer(stateBefore, actions.addCharacter('A'), mockedData);
		let expectedState = { searchTerm: ['A'], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		// ['A'] + 'B' = ['A', 'B']
		stateBefore = { searchTerm: ['A'], selectedSuggestionIndex: 2 };
		stateAfter = reducer(stateBefore, actions.addCharacter('B'), mockedData);
		expectedState = { searchTerm: ['A', 'B'], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		// ['A'] + ' ' = ['A', ' ']
		stateBefore = { searchTerm: ['A'], selectedSuggestionIndex: 3 };
		stateAfter = reducer(stateBefore, actions.addCharacter(' '), mockedData);
		expectedState = { searchTerm: ['A', ' '], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		// ['A', ' '] + ' ' = ['A', ' '] // ignore subsequent spaces
		stateBefore = { searchTerm: ['A', ' '], selectedSuggestionIndex: 4 };
		stateAfter = reducer(stateBefore, actions.addCharacter(' '), mockedData);
		expectedState = { searchTerm: ['A', ' '], selectedSuggestionIndex: 4 };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should remove the last added character from the search term, reset the selected suggestion and submitted emoji', () => {
		// [] => []
		let stateBefore = { searchTerm: [], selectedSuggestionIndex: 0 };
		let stateAfter = reducer(stateBefore, actions.removeCharacter(), mockedData);
		let expectedState = { searchTerm: [], selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		// ['A'] => []
		stateBefore = { searchTerm: ['A'], selectedSuggestionIndex: 1, emoji: 'AA' };
		stateAfter = reducer(stateBefore, actions.removeCharacter(), mockedData);
		expectedState = { searchTerm: [], selectedSuggestionIndex: 0, emoji: null };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should select the next suggestion', () => {
		// [1, 2, 3] | 0 => 1
		let suggestedEmoji = () => [1, 2, 3];
		let stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		let stateAfter = reducer(stateBefore, actions.selectNextSuggestion(), mockedData);
		let expectedState = { suggestedEmoji, selectedSuggestionIndex: 1 };
		expect(stateAfter).to.deep.equal(expectedState);

		// [1, 2, 3] | 2 => 0 // cycle from last to first
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 2 };
		stateAfter = reducer(stateBefore, actions.selectNextSuggestion(), mockedData);
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);

		// [] | 0 => 0
		suggestedEmoji = () => [];
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.selectNextSuggestion(), mockedData);
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should select the previous suggestion', () => {
		// [1, 2, 3] | 2 => 1 // cycle from last to first
		let suggestedEmoji = () => [1, 2, 3];
		let stateBefore = { suggestedEmoji, selectedSuggestionIndex: 2 };
		let stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion(), mockedData);
		let expectedState = { suggestedEmoji, selectedSuggestionIndex: 1 };
		expect(stateAfter).to.deep.equal(expectedState);

		// [1, 2, 3] | 0 => 2 // cycle from first to last
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion(), mockedData);
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 2 };
		expect(stateAfter).to.deep.equal(expectedState);

		// [] | 0 => 0
		suggestedEmoji = () => [];
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion(), mockedData);
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should submit the selected suggested emoji', () => {
		let suggestedEmoji = () => [
			{ output: 'A' },
			{ output: 'B' },
			{ output: 'C' },
		];

		// Submit C at index 2:
		let stateBefore = { suggestedEmoji, selectedSuggestionIndex: 2 };
		let stateAfter = reducer(stateBefore, actions.submit(), mockedData);
		let expectedState = { suggestedEmoji, selectedSuggestionIndex: 2, emoji: 'C' };
		expect(stateAfter).to.deep.equal(expectedState);

		// Don't submit when no suggestions:
		suggestedEmoji = () => [];
		stateBefore = { suggestedEmoji, selectedSuggestionIndex: 0 };
		stateAfter = reducer(stateBefore, actions.submit(), mockedData);
		expectedState = { suggestedEmoji, selectedSuggestionIndex: 0 };
		expect(stateAfter).to.deep.equal(expectedState);
	});
});
