/* globals describe it */
import { expect } from 'chai';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { LazierLoadOperator } from '../../';

class Entry {
  constructor(key, value) {
    Object.assign(this, { key, value });
  }
}

describe('LazierLoadOperator', () => {
  it('should start loading just once per key', (done) => {
    const subject = new Subject();
    const operator = new LazierLoadOperator(
      entry => of({ entry, loaded: true }),
      entry => entry.value,
      0,
      entry => entry.key
    );

    const loaded = [];
    subject.lift(operator).subscribe(::loaded.push);

    const entries = [
      new Entry('Bob', true),
      new Entry('John', true),
      new Entry('Bob', true),
      new Entry('John', true),
      new Entry('Anny', true)
    ];
    entries.forEach(::subject.next);

    setTimeout(() => {
      expect(loaded.length).to.equal(3);
      expect(loaded[0].entry).to.equal(entries[0]);
      expect(loaded[0].loaded).to.equal(true);
      expect(loaded[1].entry).to.equal(entries[1]);
      expect(loaded[1].loaded).to.equal(true);
      expect(loaded[2].entry).to.equal(entries[4]);
      expect(loaded[2].loaded).to.equal(true);
      done();
    }, 1);
  });

  it('should cancel loading if false entry came before debounce time passed.', (done) => {
    const subject = new Subject();
    const operator = new LazierLoadOperator(
      entry => of({ entry, loaded: true }),
      entry => entry.value,
      100,
      entry => entry.key
    );

    const loaded = [];
    subject.lift(operator).subscribe(::loaded.push);

    const entries = [
      new Entry('Bob', true),
      new Entry('Bob', false)
    ];
    entries.map(::subject.next);

    setTimeout(() => {
      expect(loaded.length).to.equal(0);
      done();
    }, 200);
  });
});
