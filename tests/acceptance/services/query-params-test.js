import Route from '@ember/routing/route';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { settled, visit } from '@ember/test-helpers';
import Controller from '@ember/controller';

module('Integration | Service | query-params', (hooks) => {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await visit('/');

    this.service = this.owner.lookup('service:state');
  });

  test('it handles replace query params', async function (assert) {
    const pointer = this.service.get('current.index');
    let controller;

    this.owner.register(
      'route:foo',
      class extends Route {
        queryParams = {
          test: {
            refreshModel: true,
            replace: true,
          },
        };
        setupController(ctr) {
          super.setupController(...arguments);
          controller = ctr;
        }
      }
    );

    this.owner.register(
      'controller:foo',
      class extends Controller {
        queryParams = ['test'];
        test = null;
      }
    );

    await visit('/foo');

    controller.set('test', 'foo');

    await settled();

    assert.equal(this.service.get('previous.index'), pointer);
    assert.equal(this.service.get('current.index'), pointer + 1);
  });
});
