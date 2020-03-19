/* global replace */
/* eslint-disable no-magic-numbers */
import Route from '@ember/routing/route';

import { module, test } from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';
import destroyApp from 'dummy/tests/helpers/destroy-app';

let service;

module('Integration | Service | replace-state', function(hooks) {
  hooks.beforeEach(function() {
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
  });

  hooks.afterEach(function() {
      return andThen(() => {
          history.pushState('', document.title, window.location.pathname + window.location.search);
          destroyApp(this.application);
      });
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
});
