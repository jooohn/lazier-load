export class LoadingStatus {
  constructor({ data, error, started, loaded }) {
    Object.assign(this, { data, error, started, loaded });
  }

  static succeeded(data) {
    return new LoadingStatus({ data, started: true, loaded: true });
  }

  static failed(error) {
    return new LoadingStatus({ error, started: true, loaded: true });
  }
}
export const waiting = new LoadingStatus({});
export const loading = new LoadingStatus({ started: true });

export const loadWithStatus = load => value => load(value)
  .map(LoadingStatus.succeeded)
  .catch(LoadingStatus.failed)
  .startWith(loading);
