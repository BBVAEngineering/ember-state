/* global replace */
/* eslint-disable no-magic-numbers */
import { module, test } from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';
import destroyApp from 'dummy/tests/helpers/destroy-app';

let service;

module('Integration | Service | state', {
	beforeEach() {
		this.application = startApp();

		const router = this.application.__container__.lookup('router:main');

		router.location = 'hash';

		service = this.application.__container__.lookup('service:state');
	},
	afterEach() {
		destroyApp(this.application);

		window.history.pushState(null, null, '');

		window.location.hash = '';
	}
});

test('it exists in the app and is enabled', (assert) => {
	assert.ok(service);
	assert.ok(service.get('isEnabled'));
});

test('it returns current state', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	andThen(() => {
		assert.equal(service.get('current.index'), pointer + 1, 'current index points to history index');
	});
});

test('it returns last state', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	andThen(() => {
		assert.equal(service.get('last.index'), pointer + 1, 'last index points to last state index');
	});
});

test('it returns current and last state on forward', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	andThen(() => {
		assert.equal(service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
	});
});

test('it returns current and last state on back', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	back();

	andThen(() => {
		assert.equal(service.get('next.index'), pointer + 2, 'next index points to history after current index');
		assert.equal(service.get('current.index'), pointer + 1, 'current index points to history index');
		assert.equal(service.get('previous.index'), pointer, 'previous index points to history before current index');
	});
});

test('it triggers back event', (assert) => {
	assert.expect(4);

	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	andThen(() => {
		service.on('back', function(current, last) {
			assert.deepEqual(this.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 2, 'last index points to last state index');
			assert.equal(current.index, pointer + 1, 'current index points to history index');
			assert.equal(service.get('previous.index'), pointer, 'previous index points to history before current index');
		});
	});

	back();
});

test('it triggers forward event', (assert) => {
	assert.expect(4);

	const pointer = window.history.length - 1;

	visit('/foo');

	andThen(() => {
		service.on('forward', function(current, last) {
			assert.deepEqual(this.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 1, 'last index points to last state index');
			assert.equal(current.index, pointer + 2, 'current index points to history index');
			assert.equal(service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
		});
	});

	visit('/bar');
});

test('it triggers both events', (assert) => {
	assert.expect(8);

	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	andThen(() => {
		service.on('back', function(current, last) {
			assert.deepEqual(this.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 2, 'last index points to last state index');
			assert.equal(current.index, pointer + 1, 'current index points to history index');
			assert.equal(service.get('previous.index'), pointer, 'previous index points to history before current index');
		});
	});

	back();

	andThen(() => {
		service.on('forward', function(current, last) {
			assert.deepEqual(this.get('current'), current, 'current objects are equals');
			assert.equal(last.index, pointer + 1, 'last index points to last state index');
			assert.equal(current.index, pointer + 2, 'current index points to history index');
			assert.equal(service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
		});

		window.history.forward();
	});
});

test('it push state to history', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	andThen(() => {
		service.push({ foo: 'bar' }, 'title');

		assert.equal(service.get('current.foo'), 'bar', 'state is pushed');
		assert.equal(service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
	});
});

test('it replaces state to history', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	andThen(() => {
		service.replace({ foo: 'bar' }, 'title');

		assert.equal(service.get('current.foo'), 'bar', 'state is replaced');
		assert.equal(service.get('current.index'), pointer + 1, 'current index points to history index');
	});
});

test('it returns last state on push', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	andThen(() => {
		service.push({ foo: 'bar' });

		assert.equal(service.get('current.foo'), 'bar', 'state is pushed');
		assert.equal(service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(service.get('last.index'), pointer + 1, 'last index points to last state index');
	});
});

test('it returns last state on back and push', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	back();

	andThen(() => {
		service.push({ foo: 'bar' });

		assert.equal(service.get('current.foo'), 'bar', 'state is pushed');
		assert.equal(service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(service.get('last.index'), pointer + 1, 'last index points to last state index');
	});
});

test('it returns last state on back and go', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	andThen(() => {
		service.replace({ foo: 'bar' });
	});

	back();

	visit('/wow');

	andThen(() => {
		assert.notOk(service.get('current.foo'), 'state is not pushed');
		assert.equal(service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(service.get('last.index'), pointer + 1, 'last index points to last state index');
	});
});

test('it returns ordered navigation states', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	visit('/bar');

	back();

	visit('/bar');

	andThen(() => {
		service.push({ foo: 'bar' });

		const states = service.get('states');

		assert.equal(states.length, 4, 'navigation states has all states');
		assert.equal(states[0], states.findBy('index', pointer), 'first state exists in first position');
		assert.equal(states[1], states.findBy('index', pointer + 1), 'first state exists in first position');
		assert.equal(states[2], states.findBy('index', pointer + 2), 'first state exists in first position');
		assert.equal(states[3], states.findBy('index', pointer + 3), 'first state exists in first position');
	});
});

test('it pushes state without params', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	andThen(() => {
		service.push();

		assert.equal(service.get('current.index'), pointer + 2, 'current index points to history index');
		assert.equal(service.get('previous.index'), pointer + 1, 'previous index points to history before current index');
	});
});

test('it returns current and last state on replace', (assert) => {
	const pointer = window.history.length - 1;

	visit('/foo');

	replace('/bar');

	andThen(() => {
		assert.equal(service.get('current.index'), pointer + 1, 'current index points to history index');
		assert.equal(service.get('previous.index'), pointer + 0, 'previous index points to history before current index');
		assert.equal(service.get('last.index'), pointer + 0, 'last index points to last state index');
	});
});

test('it has no previous pointer when replacing first route', (assert) => {
	const pointer = window.history.length - 1;

	replace('/foo');

	andThen(() => {
		assert.equal(service.get('current.index'), pointer + 0, 'current index points to history index');
		assert.notOk(service.get('previous'), 'previous index points to nowhere');
		assert.equal(service.get('last.index'), pointer + 0, 'last index points to last state index');
	});
});

test('it preserves history state when replaced', (assert) => {
	const pointer = window.history.length - 1;

	replace('/foo');

	visit('/bar');

	back();

	andThen(() => {
		assert.equal(service.get('current.index'), pointer, 'current index points to history index');
		assert.notOk(service.get('previous'), 'previous index points to nowhere');
		assert.equal(service.get('last.index'), pointer + 1, 'last index points to last state index');
	});
});

test('it throws an error when push tries to set a non object', (assert) => {
	assert.throws(() => {
		service.push('foo');
	});
});

test('it throws an error when replace tries to set a non object', (assert) => {
	assert.throws(() => {
		service.replace('foo');
	});
});
