// https://blog.sigplan.org/2019/12/30/defunctionalization-everybody-does-it-nobody-talks-about-it/

export {};

type Filter = OddFilter | EvenFilter | LessThanFilter | AndFilter;

interface Predicate1 {
  run(x: number): boolean;
}

interface Predicate2 {
  run(x: number, y: number): boolean;
}

class OddFilter {
  public readonly tag: "IsOdd" = "IsOdd";
}

class EvenFilter {
  public readonly tag: "IsEven" = "IsEven";
}

class LessThanFilter {
  public readonly tag: "LessThan" = "LessThan";
  constructor(public readonly n: number) {}
}

class AndFilter {
  public readonly tag: "And" = "And";
  constructor(public readonly f1: Filter, public readonly f2: Filter) {}
}

class OddPredicate implements Predicate1 {
  private readonly evenPredicate = new EvenPredicate();
  run(x: number): boolean {
    return Number.isInteger(x) && !this.evenPredicate.run(x);
  }
}

class EvenPredicate implements Predicate1 {
  run(x: number): boolean {
    return Number.isInteger(x) && x % 2 === 0;
  }
}

class LessThanPredicate implements Predicate2 {
  run(x: number, y: number): boolean {
    return x > y;
  }
}

class FilterMachine {
  constructor(
    private readonly isOdd: Predicate1,
    private readonly isEven: Predicate1,
    private readonly lessThan: Predicate2
  ) {}

  private readonly apply = (f: Filter, x: number): boolean => {
    switch (f.tag) {
      case "IsOdd": {
        return this.isOdd.run(x);
      }
      case "IsEven": {
        return this.isEven.run(x);
      }
      case "LessThan": {
        const { n } = f;
        return this.lessThan.run(n, x);
      }
      case "And": {
        const { f1, f2 } = f;
        return this.apply(f1, x) && this.apply(f2, x);
      }
      default: {
        const never: never = f;
        throw new Error(`unknown filter ${never}`);
      }
    }
  };

  public readonly filter = (f: Filter, ns: number[]): number[] => {
    const filtered: number[] = [];

    for (let i = 0; i < ns.length; i++) {
      const x = ns[i];
      if (this.apply(f, x)) filtered.push(x);
    }

    return filtered;
  };
}

const machine = new FilterMachine(
  new OddPredicate(),
  new EvenPredicate(),
  new LessThanPredicate()
);

console.log(machine.filter(new OddFilter(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(machine.filter(new EvenFilter(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(machine.filter(new LessThanFilter(4), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(
  machine.filter(new AndFilter(new OddFilter(), new LessThanFilter(4)), [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
  ])
);

// All told, here’s the general procedure for defunctionalization:
//    1.  Collect all functions passed as an argument to the filter function.
//    2.  Create a data type, with one variant for each possible function,
//        each with fields to store the free variables referenced by the
//        corresponding function.
//    3.  Replace the invocation of the filter condition with an apply
//        function, which determines what filter condition the data structure
//        represents, and executes it.
