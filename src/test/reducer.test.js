import reducer, { internals } from '../reducer';
import * as actions from '../actions';
import { createSelectSuggestedEmojiForQuery } from '../query-selectors';

const { selectCurrentQuery } = internals;

const poop = {
	searchTerm: ['p', 'o', 'o', 'p'],
	selectedSuggestionIndex: 0,
	emoji: '💩',
};

describe('reducer', () => {
	it('should select the most recent query', () => {
		expect(selectCurrentQuery({ queries: [1] })).to.equal(1);
		expect(selectCurrentQuery({ queries: [1, 2, 3] })).to.equal(3);
	});

	it('should return the initial state', () => {
		const initialState = reducer(undefined, {});
		expect(initialState).to.have.all.keys('queries', 'submitted', 'history', 'positionInHistory', 'findSuggestedEmoji');
		expect(initialState.queries)
			.to.be.an('array')
				.with.deep.property('[0]')
					.that.has.all.keys('searchTerm', 'selectedSuggestionIndex', 'emoji', 'findSuggestedEmoji');
		expect(initialState.submitted).to.equal(false);
		expect(initialState.history).to.deep.equal([]);
		expect(initialState.positionInHistory).to.equal(-1);
		expect(initialState.findSuggestedEmoji).to.be.a('function');
		expect(initialState.findSuggestedEmoji()).to.be.an('array');
		expect(initialState.findSuggestedEmoji().length).to.equal(0);
	});

	it('should return the same state if the action is not recognized', () => {
		const stateBefore = {};
		expect(reducer(stateBefore, { type: 'SOME_UNSUPPORTED_ACTION' })).to.deep.equal(stateBefore);
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
			positionInHistory: -1,
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
			positionInHistory: -1,
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
			positionInHistory: -1,
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
					findSuggestedEmoji: () => [1, 2, 3],
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
					findSuggestedEmoji: () => [1, 2, 3],
				},
			],
		};
		const stateAfter = reducer(stateBefore, actions.selectPreviousSuggestion());
		expect(stateAfter.queries[1].selectedSuggestionIndex).to.equal(0);
	});

	it('should set a new suggested emoji accessor function', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					findSuggestedEmoji: () => [1, 2, 3],
				},
			],
			findSuggestedEmoji: () => [1, 2, 3],
			positionInHistory: 1,
		};
		const newFindSuggestedEmoji = () => [4, 5, 6];
		const expectedState = {
			queries: [
				poop,
				{
					findSuggestedEmoji: newFindSuggestedEmoji,
				},
			],
			findSuggestedEmoji: newFindSuggestedEmoji,
			positionInHistory: -1,
		};
		const stateAfter = reducer(stateBefore, actions.setFindSuggestedEmoji(newFindSuggestedEmoji));
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should let the current query handle the submission of a single emoji', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 1,
					emoji: null,
					findSuggestedEmoji: () => [
						{ output: 1 },
						{ output: '🦄' },
						{ output: 3 },
					],
				},
			],
			history: [],
			positionInHistory: -1,
		};
		const stateAfter = reducer(stateBefore, actions.submit());
		expect(stateAfter.queries[1].emoji).to.equal('🦄');
		expect(stateAfter.queries.length).to.equal(3);
	});

	it('should build up and navigate through the history of submitted queries', () => {
		const data = [
			{
				search: 'unicorn',
				output: '🦄',
			},
			{
				search: 'poop',
				output: '💩',
			},
		];

		// Init:
		let state = reducer(undefined, {});
		state = reducer(state, actions.setFindSuggestedEmoji(createSelectSuggestedEmojiForQuery(data)));
		expect(state.history.length).to.equal(0);
		expect(state.positionInHistory).to.equal(-1);

		// Try navigating empty history:
		state = reducer(state, actions.selectPreviousQuery());
		expect(state.positionInHistory).to.equal(-1);
		state = reducer(state, actions.selectNextQuery());
		expect(state.positionInHistory).to.equal(-1);

		// Build up history:
		'unicorn'.split('').forEach((character) => {
			state = reducer(state, actions.addCharacter(character));
		});
		state = reducer(state, actions.submit());
		expect(state.history.length).to.equal(1);
		expect(state.positionInHistory).to.equal(-1);
		'poop'.split('').forEach((character) => {
			state = reducer(state, actions.addCharacter(character));
		});
		state = reducer(state, actions.submit());
		expect(state.history.length).to.equal(2);
		expect(state.positionInHistory).to.equal(-1);

		// Don't add subsequent identical query to history:
		'poop'.split('').forEach((character) => {
			state = reducer(state, actions.addCharacter(character));
		});
		state = reducer(state, actions.submit());
		expect(state.history.length).to.equal(2);
		expect(state.positionInHistory).to.equal(-1);

		// Navigate through history:
		state = reducer(state, actions.selectNextQuery());
		expect(state.positionInHistory).to.equal(-1);
		state = reducer(state, actions.selectPreviousQuery());
		expect(state.positionInHistory).to.equal(0);
		state = reducer(state, actions.selectPreviousQuery());
		expect(state.positionInHistory).to.equal(1);
		state = reducer(state, actions.selectPreviousQuery());
		expect(state.positionInHistory).to.equal(1);
		state = reducer(state, actions.selectNextQuery());
		expect(state.positionInHistory).to.equal(0);
		state = reducer(state, actions.selectNextQuery());
		expect(state.positionInHistory).to.equal(-1);
	});

	it('should submit the sequence of submitted emoji', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 1,
					emoji: '🦄',
					findSuggestedEmoji: () => [
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
			submitted: false,
		};
		const stateAfter = reducer(stateBefore, actions.submit());
		expect(stateAfter.submitted).to.equal(true);
	});

	it('should reset the sequence of submitted emoji', () => {
		const stateBefore = {
			queries: [
				poop,
				{
					searchTerm: ['u', 'n', 'i', 'c'],
					selectedSuggestionIndex: 1,
					emoji: '🦄',
					findSuggestedEmoji: () => [
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
			submitted: false,
		};
		const stateAfter = reducer(stateBefore, actions.reset());
		expect(stateAfter).to.have.all.keys('queries', 'submitted', 'history', 'positionInHistory', 'findSuggestedEmoji');
		expect(stateAfter.data).to.equal(stateBefore.data);
		expect(stateAfter.queries)
			.to.be.an('array')
				.with.deep.property('[0]')
					.that.has.all.keys('searchTerm', 'selectedSuggestionIndex', 'emoji', 'findSuggestedEmoji');
		expect(stateAfter.submitted).to.equal(false);
	});
});
