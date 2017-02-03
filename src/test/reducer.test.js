import reducer, { internals } from '../reducer';
import * as actions from '../actions';

const { selectCurrentQuery } = internals;

const mockedData = [
	{
		search: 'unicorn',
		output: '🦄',
	},
];

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
		expect(initialState).to.have.all.keys('data', 'queries', 'submitted', 'history', 'positionInHistory');
		expect(initialState.data).to.equal(null);
		expect(initialState.queries)
			.to.be.an('array')
				.with.deep.property('[0]')
					.that.has.all.keys('searchTerm', 'selectedSuggestionIndex', 'emoji', 'suggestedEmoji');
		expect(initialState.submitted).to.equal(false);
	});

	it('should be inoperable if data is not set', () => {
		const stateBefore = { data: null, queries: [] };
		expect(reducer(stateBefore, actions.addCharacter('b'))).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.removeCharacter())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.selectNextSuggestion())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.selectPreviousSuggestion())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.submit())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.reset())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.selectPreviousQuery())).to.deep.equal(stateBefore);
		expect(reducer(stateBefore, actions.selectNextQuery())).to.deep.equal(stateBefore);
	});

	it('should return the same state if the action is not recognized', () => {
		const stateBefore = { data: mockedData, queries: [] };
		expect(reducer(stateBefore, { type: 'SOME_UNSUPPORTED_ACTION' })).to.deep.equal(stateBefore);
	});

	it('should set the data', () => {
		const stateBefore = { data: null, queries: [] };
		const stateAfter = reducer(stateBefore, actions.setData(mockedData));
		const expectedState = { data: mockedData, queries: [] };
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should let the current query handle the addition of a character', () => {
		const stateBefore = {
			data: mockedData,
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
			data: mockedData,
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
			data: mockedData,
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
			data: mockedData,
			queries: [
				poop,
			],
			positionInHistory: -1,
		};
		expect(stateAfter).to.deep.equal(expectedState);
	});

	it('should let the current query handle the removal of the last added character', () => {
		const stateBefore = {
			data: mockedData,
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
			data: mockedData,
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
			data: mockedData,
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
			data: mockedData,
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
			data: mockedData,
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
		state = reducer(state, actions.setData(data));
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
			data: mockedData,
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
			submitted: false,
		};
		const stateAfter = reducer(stateBefore, actions.submit());
		expect(stateAfter.submitted).to.equal(true);
	});

	it('should reset the sequence of submitted emoji (but not it\'s underlying data)', () => {
		const stateBefore = {
			data: mockedData,
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
			submitted: false,
		};
		const stateAfter = reducer(stateBefore, actions.reset());
		expect(stateAfter).to.have.all.keys('data', 'queries', 'submitted', 'history', 'positionInHistory');
		expect(stateAfter.data).to.equal(stateBefore.data);
		expect(stateAfter.queries)
			.to.be.an('array')
				.with.deep.property('[0]')
					.that.has.all.keys('searchTerm', 'selectedSuggestionIndex', 'emoji', 'suggestedEmoji');
		expect(stateAfter.submitted).to.equal(false);
	});
});
