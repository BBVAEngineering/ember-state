import Ember from 'ember';

export default Ember.Test.registerAsyncHelper('replace', (app, url) => {
	const router = app.__container__.lookup('router:main');
	let shouldHandleURL = false;

	app.boot().then(() => {
		router.replaceWith(url);

		if (shouldHandleURL) {
			Ember.run(app.__deprecatedInstance__, 'handleURL', url);
		}
	});

	if (app._readinessDeferrals > 0) {
		router.initialURL = url;
		Ember.run(app, 'advanceReadiness');
		delete router.initialURL;
	} else {
		shouldHandleURL = true;
	}

	return app.testHelpers.wait();
});
