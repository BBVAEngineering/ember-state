import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
// import './helpers/back';
// import './helpers/replace';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();
