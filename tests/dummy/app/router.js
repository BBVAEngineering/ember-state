import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
	location: config.locationType,
	rootURL: config.rootURL
});

Router.map(function() {
	this.route('reset');
	this.route('foo');
	this.route('bar');
	this.route('wow');
});

export default Router;
