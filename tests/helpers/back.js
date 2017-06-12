import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('back', (app) => {
	Ember.run(window.history, 'back');

	return app.testHelpers.wait();
});
