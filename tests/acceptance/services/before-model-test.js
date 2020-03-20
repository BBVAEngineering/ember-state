import Route from '@ember/routing/route';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import back from '../../helpers/back';
import replace from '../../helpers/replace';

module('Integration | Service | before-model', (hooks) => {
	setupApplicationTest(hooks);

	hooks.beforeEach(async function() {
		await visit('/');

		this.service = this.owner.lookup('service:state');
	});

	test('it checks replace in beforeModel', async function(assert) {
		const pointer = this.service.get('current.index');

		this.owner.register('route:foo', Route.extend({
			beforeModel() {
				replace('/bar');
			}
		}));

		await visit('/foo');

		assert.equal(this.service.get('current.index'), pointer + 1);
	});

	test('it checks back after loaded route', async function(assert) {
		const pointer = this.service.get('current.index');

		this.owner.register('route:foo', Route.extend({
			beforeModel() {
				replace('/bar');
			}
		}));

		await visit('/foo');

		await back();

		assert.equal(this.service.get('current.index'), pointer);
	});

	test('it checks replaceWith in beforeModel', async function(assert) {
		const pointer = this.service.get('current.index');

		this.owner.register('route:foo', Route.extend({
			beforeModel() {
				this.replaceWith('bar');
			}
		}));

		await visit('/foo');

		assert.equal(this.service.get('current.index'), pointer + 1);
	});

	test('it checks visit in beforeModel', async function(assert) {
		const pointer = this.service.get('current.index');

		this.owner.register('route:foo', Route.extend({
			beforeModel() {
				visit('/bar');
			}
		}));

		await visit('/foo');

		assert.equal(this.service.get('current.index'), pointer + 2);
	});

	test('it checks transitionTo in beforeModel', async function(assert) {
		const pointer = this.service.get('current.index');

		this.owner.register('route:foo', Route.extend({
			beforeModel() {
				this.transitionTo('bar');
			}
		}));

		await visit('/foo');

		assert.equal(this.service.get('current.index'), pointer + 2);
	});
});
