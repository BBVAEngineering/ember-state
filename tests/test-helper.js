import Application from '../app';
import { setApplication } from '@ember/test-helpers';
import './helpers/back';
import './helpers/replace';
import { start } from 'ember-qunit';

setApplication(Application.create({ autoboot: false }));

start();
