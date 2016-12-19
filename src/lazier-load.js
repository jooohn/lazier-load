import { Subject } from 'rxjs/Subject';
import { LazierLoadOperator } from './operator/lazier-load';
import { loadWithStatus } from './load-with-status';
import { wrapWithObservable } from './wrap-with-observable';

const defaultKeySelector = ({ entry }) => entry.target;
const defaultPredicate = ({ entry }) => entry.intersectionRatio > 0;
const defaultDurationSelector = 300;

const wrapLoad = load => ({ entry, observable }) =>
  loadWithStatus(wrapWithObservable(load))
    .map(loadingStatus => ({
      entry,
      observable,
      loadingStatus
    }));

export default class LazierLoad {

  constructor(load, {
    root,
    rootMargin,
    threshold,
    keySelector = defaultKeySelector,
    predicate = defaultPredicate,
    delay = defaultDurationSelector
  }) {
    const entry$ = new Subject();
    const lazierLoadOperator =
      new LazierLoadOperator(wrapLoad(load), predicate, delay, keySelector);
    const lazierLoad$ = entry$.lift(lazierLoadOperator).share();
    this.lazierLoad$ = lazierLoad$;
    this.subscribe = ::lazierLoad$.subscribe;

    this.intersectionObserver =
      new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => entry$.next({ entry, observer }));
      }, { root, rootMargin, threshold });
  }

  observe(elem) {
    this.intersectionObserver.observe(elem);
  }

  unobserve(elem) {
    this.intersectionObserver.unobserve(elem);
  }

  disconnect() {
    this.intersectionObserver.disconnect();
  }
}
