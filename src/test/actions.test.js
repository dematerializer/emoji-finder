import * as actions from '../actions';
import * as types from '../constants';

describe('actions', () => {
	it('should create an action to add a character', () => {
		const character = 'a';
		const expectedAction = { type: types.ADD_CHARACTER, character };
		expect(actions.addCharacter(character)).to.deep.equal(expectedAction);
	});
	it('should create an action to remove a character', () => {
		const expectedAction = { type: types.REMOVE_CHARACTER };
		expect(actions.removeCharacter()).to.deep.equal(expectedAction);
	});
	it('should create an action to select the next suggested emoji', () => {
		const expectedAction = { type: types.SELECT_NEXT_SUGGESTION };
		expect(actions.selectNextSuggestion()).to.deep.equal(expectedAction);
	});
	it('should create an action to select the previous suggested emoji', () => {
		const expectedAction = { type: types.SELECT_PREVIOUS_SUGGESTION };
		expect(actions.selectPreviousSuggestion()).to.deep.equal(expectedAction);
	});
	it('should create an action to submit the sequence of submitted emoji', () => {
		const expectedAction = { type: types.SUBMIT };
		expect(actions.submit()).to.deep.equal(expectedAction);
	});
	it('should create an action to reset the sequence of submitted emoji', () => {
		const expectedAction = { type: types.RESET };
		expect(actions.reset()).to.deep.equal(expectedAction);
	});
	it('should create an action to go backward in the history of submitted queries', () => {
		const expectedAction = { type: types.SELECT_PREVIOUS_QUERY };
		expect(actions.selectPreviousQuery()).to.deep.equal(expectedAction);
	});
	it('should create an action to go forward in the history of submitted queries', () => {
		const expectedAction = { type: types.SELECT_NEXT_QUERY };
		expect(actions.selectNextQuery()).to.deep.equal(expectedAction);
	});
	it('should create an action to set the selector function that is used to find suggested emoji', () => {
		const findSuggestedEmoji = () => [];
		const expectedAction = {
			type: types.SET_FIND_SUGGESTED_EMOJI,
			findSuggestedEmoji,
		};
		expect(actions.setFindSuggestedEmoji(findSuggestedEmoji)).to.deep.equal(expectedAction);
	});
});
