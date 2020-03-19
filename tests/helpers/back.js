import { run } from '@ember/runloop';
import { registerAsyncHelper } from '@ember/test';

export default registerAsyncHelper('back', (app) =>
	app.testHelpers.andThen(() => {
		run(window.history, 'back');

		return app.testHelpers.wait();
	})
);
