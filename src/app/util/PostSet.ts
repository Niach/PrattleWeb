import {Post} from '../contracts/Post';

export class PostSet<T extends Post> extends Array<T> {
  constructor(...items: T[]) {
    super(...items);
    Object.setPrototypeOf(this, PostSet.prototype);
  }

  pushUnique(value: Post) {
    let found = false;
    this.forEach(item => {
      if (value.equals(item)) {
        found = true;
      }
    });

    if (!found) {
      super.unshift(value as T);
    }
  }

}

/*
  add(value: T): this {
    let found = false;
    this.forEach(item => {
      if (value.equals(item)) {
        found = true;
      }
    });

    if (!found) {
      super.add(value);
    }

    return this;
  }
*/

