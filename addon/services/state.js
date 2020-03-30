import { sort } from '@ember/object/computed';
import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';
import { schedule } from '@ember/runloop';

const { location } = window;

/**
 * State service that manage browser history navigation.
 *
 * When browser navigates it emits events `forward` and `back`.
 *
 * @extends Ember.Service
 */
export default Service.extend(Evented, {

	/**
	 * Array with all history states.
	 *
	 * @property content
	 * @type Array
	 */
	content: null,

	/**
	 * Sorting property of content.
	 *
	 * @property contentSorting
	 * @type Array
	 */
	// eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
	contentSorting: ['index'],

	/**
	 * Array with all history states ordered by index.
	 *
	 * @property states
	 * @type Array
	 */
	states: sort('content', 'contentSorting'),

	/**
	 * Pointer to the current state.
	 *
	 * @property pointer
	 * @type Number
	 */
	pointer: 0,

	/**
	 * Check if service should be enabled.
	 *
	 * @property isEnabled
	 * @return Boolean
	 */
	get isEnabled() {
		const userAgent = window.navigator.userAgent;

		return !userAgent.match(/CriOS/);
	},

	/**
	 * Returns the next state of the history.
	 *
	 * @property next
	 * @type Object
	 */
	next: computed('content.[]', 'pointer', function() {
		const pointer = this.get('pointer') + 1;

		return this.get('content').findBy('index', pointer);
	}),

	/**
	 * Returns the current state of the history.
	 *
	 * @property current
	 * @type Object
	 */
	current: computed('content.[]', 'pointer', function() {
		const pointer = this.get('pointer');

		return this.get('content').findBy('index', pointer);
	}),

	/**
	 * Returns the previous state of the history.
	 *
	 * @property previous
	 * @type Object
	 */
	previous: computed('content.[]', 'pointer', function() {
		const pointer = this.get('pointer') - 1;

		return this.get('content').findBy('index', pointer);
	}),

	/**
	 * Returns the last navigated state of the history.
	 *
	 * @property last
	 * @type Object
	 */
	last: null,

	/**
	 * Initialize the service.
	 *
	 * @method init
	 */
	init(...args) {
		this._super(...args);

		this.set('content', A());

		if (this.get('isEnabled')) {
			this._updatePointer();

			window.addEventListener('popstate', this.get('_popstateDidChangeBinding'));

			getOwner(this).lookup('service:router').on('routeWillChange', this.get('_routeWillChangeBinding'));
			getOwner(this).lookup('service:router').on('routeDidChange', this.get('_routeDidChangeBinding'));
		}
	},

	/**
	 * Unbind pop state listener.
	 *
	 * @method willDestroy
	 */
	willDestroy(...args) {
		this._super(...args);

		if (this.get('isEnabled')) {
			window.removeEventListener('popstate', this.get('_popstateDidChangeBinding'));

			getOwner(this).lookup('service:router').off('routeWillChange', this.get('_routeWillChangeBinding'));
			getOwner(this).lookup('service:router').off('routeDidChange', this.get('_routeDidChangeBinding'));
		}
	},

	/**
	 * Push state to the history.
	 *
	 * @method push
	 * @param  {Object} state
	 * @param  {String} title
	 * @param  {String} uri
	 */
	push(state = {}, title, uri) {
		assert('state argument must be an object', typeof state === 'object');

		const current = this.get('current');

		uri = uri || location.hash;

		this.set('last', current);

		this.incrementProperty('pointer');

		state.index = this.get('pointer');

		window.history.pushState(state, title, uri);

		this._addContent(state);
	},

	/**
	 * Replace current state of the history.
	 *
	 * @method replace
	 * @param  {Object} state
	 * @param  {String} title
	 * @param  {String} uri
	 */
	replace(state, title, uri) {
		assert('state argument must be an object', typeof state === 'object');

		const current = this.get('current');

		uri = uri || location.hash;

		state.index = current.index;

		window.history.replaceState(state, title, uri);

		this._addContent(state);
	},

	/**
	 * Add state to content removing all newest states.
	 *
	 * @method  _addContent
	 * @param   {Object}    state
	 * @private
	 */
	_addContent(state) {
		let content = this.get('content');

		content = content.reject((object) => object.index >= state.index);

		content.push(state);

		this.set('content', A(content));
	},

	/**
	 * Returns a binded popstate method.
	 *
	 * @property _popstateDidChangeBinding
	 * @type Function
	 */
	_popstateDidChangeBinding: computed(function() {
		return this._popstateDidChange.bind(this);
	}),

	/**
	 * Manage popstate event.
	 *
	 * @method  _popstateDidChange
	 * @private
	 */
	_popstateDidChange(e) {
		// Prevent popping manual triggered events.
		// istanbul ignore if: unable to test
		if (e.isTrigger) {
			return;
		}

		schedule('routerTransitions', () => {
			if (this.triggerChange) {
				this.triggerChange();
			}
		});

		// eslint-disable-next-line complexity, max-statements
		this.triggerChange = (transition) => {
			const current = this.get('current');
			let state = window.history.state;

			// Always save current state as last.
			this.set('last', current);
			this.triggerChange = null;

			// If last transition is a replace, then do nothing.
			if (transition && transition.urlMethod === 'replace') {
				this._updateState();

				return;
			}

			if (isNone(state) || isNone(state.index)) {
				this.incrementProperty('pointer');
				state = this._updateState();
				this._addContent(state);
				this.trigger('forward', state, current);

				return;
			}

			// istanbul ignore else
			if (current && state.index > current.index) {
				this.incrementProperty('pointer');
				this.trigger('forward', state, current);
			} else if (current && state.index < current.index) {
				this.decrementProperty('pointer');
				this.trigger('back', state, current);
			}
		};
	},

	/**
	 * Generates a new state in the current pointer.
	 *
	 * @method  _updateState
	 * @return Object
	 * @private
	 */
	_updateState() {
		const state = {
			index: this.get('pointer')
		};

		window.history.replaceState(state, null, location.hash);

		return state;
	},

	/**
	 * Update pointer to the current history state.
	 *
	 * @method  _updatePointer
	 * @private
	 */
	_updatePointer() {
		let state = window.history.state;

		if (isNone(state) || isNone(state.index)) {
			this.set('pointer', window.history.length - 1);
			state = this._updateState();
			this._addContent(state);

			return;
		}

		this.set('pointer', state.index);

		this._addContent(state);
	},

	/**
	 * Returns a binded transition will change method.
	 *
	 * @property _routeWillChangeBinding
	 * @return Function
	 */
	_routeWillChangeBinding: computed(function() {
		return this._routeWillChange.bind(this);
	}),

	/**
	 * Save transition on will transition.
	 *
	 * @method _routeWillChange
	 * @param  {Object}             transition
	 */
	_routeWillChange(transition) {
		if (this.triggerChange) {
			this.triggerChange(transition);
		}
	},

	/**
	 * Returns a binded transition did change method.
	 *
	 * @property _routeDidChangeBinding
	 * @return Function
	 */
	_routeDidChangeBinding: computed(function() {
		return this._routeDidChange.bind(this);
	}),

	/**
	 * Save transition on did transition.
	 *
	 * @method _routeDidChange
	 * @param  {Object}             transition
	 */
	_routeDidChange(transition) {
		if (this.triggerChange) {
			this.triggerChange(transition);
		}
	}

});
