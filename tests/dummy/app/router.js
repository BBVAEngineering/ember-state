import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
	this.route('reset');
	this.route('foo');
	this.route('bar');
	this.route('wow');
});
