import { settled } from '@ember/test-helpers';

export default async function back() {
  window.history.back();

  await settled();
}
