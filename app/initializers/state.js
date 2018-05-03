export default {
	name: 'state',
	initialize(appInstance) {
		appInstance.__container__.lookup('service:state');
	}
};
