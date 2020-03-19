ember-state
==============================================================================

[![Build Status](https://travis-ci.org/BBVAEngineering/ember-state.svg?branch=master)](https://travis-ci.org/BBVAEngineering/ember-state)
[![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-state.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-state)
[![npm version](https://badge.fury.io/js/ember-state.svg)](https://badge.fury.io/js/ember-storages)
[![Dependency Status](https://david-dm.org/BBVAEngineering/ember-state.svg)](https://david-dm.org/BBVAEngineering/ember-state)

An [ember-cli addon](http://www.ember-cli.com/) with a State service that manage browser history navigation.

## Information

[![NPM](https://nodei.co/npm/ember-state.png?downloads=true&downloadRank=true)](https://nodei.co/npm/ember-state/)

## Install in ember-cli application

In your application's directory:

    ember install ember-state

## Usage

This service is to store all history states.
We can access to the following states:

- current.

- previous.

- next.

- last.

Example:

```javascript
state: inject.service(),

state.get('current.index');
state.get('previous.index');

```

## Contribute

If you want to contribute to this addon, please read the [CONTRIBUTING.md](CONTRIBUTING.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/BBVAEngineering/ember-state/tags).

## Authors

See the list of [contributors](https://github.com/BBVAEngineering/ember-state/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
