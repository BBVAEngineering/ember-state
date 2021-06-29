import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';
import { schedule } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

const { location } = window;

/**
 * State service that manage browser history navigation.
 *
 * When browser navigates it emits events `forward` and `back`.
 */
export default class StateService extends Service.extend(Evented) {
  /**
   * Array with all history states.
   */
  @tracked content = A();

  /**
   * Array with all history states ordered by index.
   */
  get states() {
    return A(this.content.sortBy('index'));
  }

  /**
   * Pointer to the current state.
   */
  @tracked pointer;

  /**
   * Check if service should be enabled.
   */
  get isEnabled() {
    const userAgent = window.navigator.userAgent;

    return !userAgent.match(/CriOS/);
  }

  /**
   * Returns the next state of the history.
   */
  get next() {
    const pointer = this.pointer + 1;

    return this.content.findBy('index', pointer);
  }

  /**
   * Returns the current state of the history.
   */
  get current() {
    const pointer = this.pointer;

    return this.content.findBy('index', pointer);
  }

  /**
   * Returns the previous state of the history.
   */
  get previous() {
    const pointer = this.pointer - 1;

    return this.content.findBy('index', pointer);
  }

  /**
   * Returns the last navigated state of the history.
   */
  @tracked last;

  /**
   * Initialize the service.
   */
  constructor(...args) {
    super(...args);

    if (this.isEnabled) {
      this._updatePointer();

      window.addEventListener('popstate', this._popstateDidChange);

      getOwner(this)
        .lookup('service:router')
        .on('routeWillChange', this._routeWillChange);
      getOwner(this)
        .lookup('service:router')
        .on('routeDidChange', this._routeDidChange);
    }
  }

  /**
   * Unbind pop state listener.
   */
  willDestroy() {
    super.willDestroy();

    if (this.isEnabled) {
      window.removeEventListener('popstate', this._popstateDidChange);

      getOwner(this)
        .lookup('service:router')
        .off('routeWillChange', this._routeWillChange);
      getOwner(this)
        .lookup('service:router')
        .off('routeDidChange', this._routeDidChange);
    }
  }

  /**
   * Push state to the history.
   *
   * @param {object} state
   * @param {string} title
   * @param {string} uri
   */
  push(state = {}, title, uri) {
    assert('state argument must be an object', typeof state === 'object');

    const current = this.current;

    uri = uri || location.hash;

    this.last = current;
    this.pointer += 1;

    state.index = this.pointer;

    window.history.pushState(state, title, uri);

    this._addContent(state);
  }

  /**
   * Replace current state of the history.
   *
   * @param {object} state
   * @param {string} title
   * @param {string} uri
   */
  replace(state, title, uri) {
    assert('state argument must be an object', typeof state === 'object');

    const current = this.current;

    uri = uri || location.hash;

    state.index = current.index;

    window.history.replaceState(state, title, uri);

    this._addContent(state);
  }

  /**
   * Add state to content removing all newest states.
   *
   * @param {object} state
   * @private
   */
  _addContent(state) {
    let content = this.content;

    content = content.reject((object) => object.index >= state.index);

    content.push(state);

    this.content = A(content);
  }

  /**
   * Manage popstate event.
   *
   * @private
   */
  @action
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
      const current = this.current;
      let state = window.history.state;

      // Always save current state as last.
      this.last = current;
      this.triggerChange = null;

      // If last transition is a replace, then do nothing.
      if (transition && transition.urlMethod === 'replace') {
        this._updateState();

        return;
      }

      if (isNone(state) || isNone(state.index)) {
        this.pointer += 1;
        state = this._updateState();
        this._addContent(state);
        this.trigger('forward', state, current);

        return;
      }

      // istanbul ignore else
      if (current && state.index > current.index) {
        this.pointer += 1;
        this.trigger('forward', state, current);
      } else if (current && state.index < current.index) {
        this.pointer -= 1;
        this.trigger('back', state, current);
      }
    };
  }

  /**
   * Generates a new state in the current pointer.
   *
   * @private
   */
  _updateState() {
    const state = {
      index: this.pointer,
    };

    window.history.replaceState(state, null, location.hash);

    return state;
  }

  /**
   * Update pointer to the current history state.
   *
   * @private
   */
  _updatePointer() {
    let state = window.history.state;

    if (isNone(state) || isNone(state.index)) {
      this.pointer = window.history.length - 1;
      state = this._updateState();
      this._addContent(state);

      return;
    }

    this.pointer = state.index;

    this._addContent(state);
  }

  /**
   * Save transition on will transition.
   *
   * @param {Object} transition
   */
  @action
  _routeWillChange(transition) {
    if (this.triggerChange) {
      this.triggerChange(transition);
    }
  }

  /**
   * Save transition on did transition.
   *
   * @param  {Object}             transition
   */
  @action
  _routeDidChange(transition) {
    if (this.triggerChange) {
      this.triggerChange(transition);
    }
  }
}
