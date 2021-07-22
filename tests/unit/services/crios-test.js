import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

function patchUserAgent() {
  Object.defineProperty(window.navigator, 'userAgent', {
    get() {
      return this._userAgent;
    },
    set(value) {
      this._userAgent = value;
    },
  });
}

module('Unit | Service | crios', (hooks) => {
  hooks.beforeEach(function () {
    this.userAgent = window.navigator.userAgent;

    patchUserAgent();

    // eslint-disable-next-line max-len
    window.navigator.userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1';
  });

  hooks.afterEach(function () {
    window.navigator.userAgent = this.userAgent;
  });

  setupTest(hooks);

  hooks.beforeEach(function () {
    this.service = this.owner.lookup('service:state');
  });

  test('it is disabled on crios', async function (assert) {
    assert.notOk(this.service.get('isEnabled'));
  });
});
