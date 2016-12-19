import 'rxjs/Subscriber';
import { map } from 'rxjs/operator/map';
import { first } from 'rxjs/operator/first';
import { distinct } from 'rxjs/operator/distinct';
import { debounce } from 'rxjs/operator/debounce';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { groupBy } from 'rxjs/operator/groupBy';
import { mergeMap } from 'rxjs/operator/mergeMap';

const itself = self => self;

export class LazierLoadOperator {

  constructor(project, predicate, durationSelector, keySelector = itself) {
    Object.assign(this, { project, predicate, durationSelector, keySelector });

    this.debounce = (typeof durationSelector === 'number')
      ? debounceTime
      : debounce;
  }

  call(observer, source) {
    return source
      ::groupBy(this.keySelector)
      ::mergeMap(::this.findEntryToLoad)
      ::mergeMap(this.project, this.concurrent)
      .subscribe(observer);
  }

  findEntryToLoad(value$) {
    return value$
      ::map(entry => ({ predicate: this.predicate(entry), entry }))
      ::distinct(({ predicate }) => predicate)
      ::debounceTime(this.durationSelector)
      ::first(({ predicate }) => predicate, ({ entry }) => entry);
  }
}
