/* global replace */
/* eslint-disable no-magic-numbers */
import {
	module,
	test
} from 'qunit';
import Ember from 'ember';
import startApp from 'dummy/tests/helpers/start-app';
import destroyApp from 'dummy/tests/helpers/destroy-app';

const {
	Route
} = Ember;

let service;

module('Integration | Service | replace-state', {
	beforeEach() {
		this.application = startApp();

		service = this.application.__container__.lookup('service:state');

		const router = this.application.__container__.lookup('router:main');

		router.location = 'hash';

		this.appInstance = this.application.__container__.owner;

		this.appInstance.register('route:foo', Route.extend({
			beforeModel() {
				replace('/bar');

				return this._super(...arguments);
			}
		}));
	},
	afterEach() {
		destroyApp(this.application);

		window.history.pushState(null, null, '');

		window.location.hash = '';
	}
});

test('it checks replace in beforeModel', (assert) => {
	visit('/foo');

	andThen(() => {
		assert.ok(service.get('lastTransition'));
		assert.equal(service.get('current.index'), window.history.length);
	});
});

test('it checks back after loaded route', (assert) => {
	visit('/foo');

	back();

	andThen(() => {
		assert.ok(service.get('lastTransition'));
		assert.equal(service.get('current.index'), window.history.length - 1);
	});
});
