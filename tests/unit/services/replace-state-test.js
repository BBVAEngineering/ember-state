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
		return andThen(() => {
			history.pushState('', document.title, window.location.pathname + window.location.search);
			destroyApp(this.application);
		});
	}
});

test('it checks replace in beforeModel', (assert) => {
	const pointer = service.get('current.index');

	visit('/foo');

	andThen(() => {
		assert.ok(service.get('lastTransition'));
		assert.equal(service.get('current.index'), pointer + 1);
	});
});

test('it checks back after loaded route', (assert) => {
	const pointer = service.get('current.index');

	visit('/foo');

	back();

	andThen(() => {
		assert.ok(service.get('lastTransition'));
		assert.equal(service.get('current.index'), pointer);
	});
});
