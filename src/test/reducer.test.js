import reducer, { internals } from '../reducer';
import * as actions from '../actions';

const { selectCurrentQuery } = internals;

const poop = {
	searchTerm: ['p', 'o', 'o', 'p'],
	selectedSuggestionIndex: 0,
	emoji: '💩',
};

describe('reducer', () => {
	it('should return the initial state', () => {
		const initialState = reducer(undefined, {});
		expect(initialState).to.have.all.keys('queries');
		expect(initialState.queries)
			.to.be.an('array')
				.with.deep.property('[0]')
					.that.has.all.keys('searchTerm', 'selectedSuggestionIndex', 'emoji', 'suggestedEmoji');
	});

	it('should select the most recent query', () => {
		expect(selectCurrentQuery({ queries: [1] })).to.equal(1);
		expect(selectCurrentQuery({ queries: [1, 2, 3] })).to.equal(3);
	});

	it('should let the current query handle the addition of a character', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 3,
					emoji: null,
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.addCharacter('o'));
		const expectedState = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c', 'o'],
					selectedSuggestionIndex: 0,
					emoji: null,
				},
			],
		};
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should remove the current query if there is no character left to be removed', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: [], // already empty
					selectedSuggestionIndex: 0,
					emoji: null,
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.removeCharacter());
		const expectedState = {
			queries: [
				poop,
			],
		};
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should let the current query handle the removal of the last added character', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 3,
					emoji: null,
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.removeCharacter());
		const expectedState = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i'],
					selectedSuggestionIndex: 0,
					emoji: null,
				},
			],
		};
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should let the current query handle the selection of the next suggestion', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 1,
					emoji: null,
					suggestedEmoji: () => [1, 2, 3],
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.selectNextSuggestion());
		expect(stateAfter.queries[1].selectedSuggestionIndex).to.equal(2);
	});

	it('should let the current query handle the selection of the previous suggestion', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 1,
					emoji: null,
					suggestedEmoji: () => [1, 2, 3],
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion());
		expect(stateAfter.queries[1].selectedSuggestionIndex).to.equal(0);
	});

	it('should let the current query handle the submission of a single emoji', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 1,
					emoji: null,
					suggestedEmoji: () => [
						{ output: 1 },
						{ output: '🦄' },
						{ output: 3 },
					],
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.submit());
		expect(stateAfter.queries[1].emoji).to.equal('🦄');
		expect(stateAfter.queries.length).to.equal(3);
	});

	it('should submit the sequence of submitted emoji', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 1,
					emoji: '🦄',
					suggestedEmoji: () => [
						{ output: 1 },
						{ output: '🦄' },
						{ output: 3 },
					],
				},
				{
					searchTerm: [],
					selectedSuggestionIndex: 0,
					emoji: null,
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.submit());
		expect(stateAfter.queries[1].emoji).to.equal('🦄');
		expect(stateAfter.queries.length).to.equal(3);
	});
});
