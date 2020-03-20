import { module, test, skip } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import back from '../../helpers/back';
import replace from '../../helpers/replace';

module('Integration | Service | state', (hooks) => {
	setupApplicationTest(hooks);

	hooks.beforeEach(async function() {
		await visit('/');

		this.service = this.owner.lookup('service:state');
	});

	test('it exists in the app and is enabled', function(assert) {
		assert.ok(this.service);
		assert.ok(this.service.get('isEnabled'));
	});

	test('it returns current state', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		assert.equal(this.service.get('current.index'), pointer + 1, 'current index points to history index');
	});

	test('it returns last state', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		assert.equal(this.service.get('last.index'), pointer + 1, 'last index points to last state index');
	});

	test('it returns current and last state on forward', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		assert.equal(this.service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(this.service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
	});

	test('it returns current and last state on back', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		await back();

		assert.equal(this.service.get('next.index'), pointer + 2, 'next index points to history after current index');
		assert.equal(this.service.get('current.index'), pointer + 1, 'current index points to history index');
		assert.equal(this.service.get('previous.index'), pointer, 'previous index points to history before current index');
	});

	test('it triggers back event', async function(assert) {
		assert.expect(4);

		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		this.service.on('back', (current, last) => {
			assert.deepEqual(this.service.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 2, 'last index points to last state index');
			assert.equal(current.index, pointer + 1, 'current index points to history index');
			assert.equal(this.service.get('previous.index'), pointer, 'previous index points to history before current index');
		});

		await back();
	});

	test('it triggers forward event', async function(assert) {
		assert.expect(4);

		const pointer = this.service.get('current.index');

		await visit('/foo');

		this.service.on('forward', (current, last) => {
			assert.deepEqual(this.service.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 1, 'last index points to last state index');
			assert.equal(current.index, pointer + 2, 'current index points to history index');
			assert.equal(this.service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
		});

		await visit('/bar');
	});

	test('it triggers both events', async function(assert) {
		assert.expect(8);

		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		this.service.on('back', (current, last) => {
			assert.deepEqual(this.service.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 2, 'last index points to last state index');
			assert.equal(current.index, pointer + 1, 'current index points to history index');
			assert.equal(this.service.get('previous.index'), pointer, 'previous index points to history before current index');
		});

		await back();

		this.service.on('forward', (current, last) => {
			assert.deepEqual(this.service.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 1, 'last index points to last state index');
			assert.equal(current.index, pointer + 2, 'current index points to history index');
			assert.equal(this.service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
		});

		window.history.forward();
	});

	test('it push state to history', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		this.service.push({ foo: 'bar' }, 'title');

		assert.equal(this.service.get('current.foo'), 'bar', 'state is pushed');
		assert.equal(this.service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(this.service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
	});

	test('it replaces state to history', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		this.service.replace({ foo: 'bar' }, 'title');

		assert.equal(this.service.get('current.foo'), 'bar', 'state is replaced');
		assert.equal(this.service.get('current.index'), pointer + 1, 'current index points to history index');
	});

	test('it returns last state on push', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		this.service.push({ foo: 'bar' });

		assert.equal(this.service.get('current.foo'), 'bar', 'state is pushed');
		assert.equal(this.service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(this.service.get('last.index'), pointer + 1, 'last index points to last state index');
	});

	test('it returns last state on back and push', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		await back();

		this.service.push({ foo: 'bar' });

		assert.equal(this.service.get('current.foo'), 'bar', 'state is pushed');
		assert.equal(this.service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(this.service.get('last.index'), pointer + 1, 'last index points to last state index');
	});

	test('it returns last state on back and go', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		this.service.replace({ foo: 'bar' });

		await back();

		await visit('/wow');

		assert.notOk(this.service.get('current.foo'), 'state is not pushed');
		assert.equal(this.service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(this.service.get('last.index'), pointer + 1, 'last index points to last state index');
	});

	test('it returns ordered navigation states', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		await visit('/bar');

		await back();

		await visit('/bar');

		this.service.push({ foo: 'bar' });

		const states = this.service.get('states');

		assert.equal(states.length, 5, 'navigation states has all states');
		assert.equal(states[1], states.findBy('index', pointer), 'first state exists in first position');
		assert.equal(states[2], states.findBy('index', pointer + 1), 'first state exists in first position');
		assert.equal(states[3], states.findBy('index', pointer + 2), 'first state exists in first position');
		assert.equal(states[4], states.findBy('index', pointer + 3), 'first state exists in first position');
	});

	test('it pushes state without params', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		this.service.push();

		assert.equal(this.service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(this.service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
	});

	test('it returns current and last state on replace', async function(assert) {
		const pointer = this.service.get('current.index');

		await visit('/foo');

		await replace('/bar');

		assert.equal(this.service.get('current.index'), pointer + 1, 'current index points to history index');
		assert.equal(this.service.get('previous.index'), pointer + 0, 'previous index points to history before current index');
		assert.equal(this.service.get('last.index'), pointer + 0, 'last index points to last state index');
	});

	skip('it has no previous pointer when replacing first route', async function(assert) {
		const pointer = this.service.get('current.index');

		await replace('/foo');

		assert.equal(this.service.get('current.index'), pointer + 0, 'current index points to history index');
		assert.notOk(this.service.get('previous'), 'previous index points to nowhere');
		assert.equal(this.service.get('last.index'), pointer + 0, 'last index points to last state index');
	});

	skip('it preserves history state when replaced', async function(assert) {
		const pointer = this.service.get('current.index');

		await replace('/foo');

		await visit('/bar');

		await back();

		assert.equal(this.service.get('current.index'), pointer, 'current index points to history index');
		assert.notOk(this.service.get('previous'), 'previous index points to nowhere');
		assert.equal(this.service.get('last.index'), pointer + 1, 'last index points to last state index');
	});

	test('it throws an error when push tries to set a non object', function(assert) {
		assert.throws(() => {
			this.service.push('foo');
		});
	});

	test('it throws an error when replace tries to set a non object', function(assert) {
		assert.throws(() => {
			this.service.replace('foo');
		});
	});
});
