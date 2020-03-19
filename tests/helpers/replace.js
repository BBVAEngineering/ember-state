import { run } from '@ember/runloop';
import { registerAsyncHelper } from '@ember/test';

export default registerAsyncHelper('replace', (app, url) => {
	const router = app.__container__.lookup('router:main');
	let shouldHandleURL = false;

	app.boot().then(() => {
		router.replaceWith(url);

		if (shouldHandleURL) {
			run(app.__deprecatedInstance__, 'handleURL', url);
		}
	});

	if (app._readinessDeferrals > 0) {
		router.initialURL = url;
		run(app, 'advanceReadiness');
		delete router.initialURL;
	} else {
		shouldHandleURL = true;
	}

	return app.testHelpers.wait();
});
