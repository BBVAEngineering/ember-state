/* eslint-disable prefer-arrow-callback */
import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
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
