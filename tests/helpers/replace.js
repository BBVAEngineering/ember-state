import { settled } from '@ember/test-helpers';

const { location } = window;

export default async function replace(hash) {
  const url = `${location.pathname}${location.search}#${hash}`;

  window.history.replaceState(null, document.title, url);

  await settled();
}
