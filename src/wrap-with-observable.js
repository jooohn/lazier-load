import { fromPromise } from 'rxjs/observable/fromPromise';
import { _throw } from 'rxjs/observable/throw';

const isObservable = any => typeof any.subscribe === 'function';
const isPromise = any => typeof any.then === 'function';

export const wrapWithObservable = (promiseOrObservable) => {
  if (isObservable(promiseOrObservable)) {
    return promiseOrObservable;
  } else if (isPromise(promiseOrObservable)) {
    return fromPromise(promiseOrObservable);
  } else {
    return _throw(new Error('The return value of "load" must be a Promise or an Observable.'));
  }
};
