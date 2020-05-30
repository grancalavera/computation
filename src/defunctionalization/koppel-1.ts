// https://blog.sigplan.org/2019/12/30/defunctionalization-everybody-does-it-nobody-talks-about-it/

// All told, here’s the general procedure for defunctionalization:
//    1.  Collect all functions passed as an argument to the filter function.
//    2.  Create a data type, with one variant for each possible function,
//        each with fields to store the free variables referenced by the
//        corresponding function.
//    3.  Replace the invocation of the filter condition with an apply
//        function, which determines what filter condition the data structure
//        represents, and executes it.

export {};

type Filter =
  | { tag: "even" }
  | { tag: "more-than"; n: number }
  | { tag: "equal-to"; n: number }
  | { tag: "and"; f1: Filter; f2: Filter }
  | { tag: "or"; f1: Filter; f2: Filter }
  | { tag: "not"; f: Filter };

type Predicate1 = (x: number) => boolean;
type Predicate2 = (x: number, y: number) => boolean;

type Apply = (f: Filter, x: number) => boolean;
type ApplyFilter = (filter: Filter, l: number[]) => number[];
type FilterStep = (f: Filter) => (xs: number[], x: number) => number[];

const Even: Filter = { tag: "even" };
const MoreThan = (n: number): Filter => ({ tag: "more-than", n });
const EqualTo = (n: number): Filter => ({ tag: "equal-to", n });
const And = (f1: Filter, f2: Filter): Filter => ({ tag: "and", f1, f2 });
const Or = (f1: Filter, f2: Filter): Filter => ({ tag: "or", f1, f2 });
const Not = (f: Filter): Filter => ({ tag: "not", f });

const Odd: Filter = Not(Even);
const LessThan = (n: number): Filter => And(Not(EqualTo(n)), Not(MoreThan(n)));
const LessThanOrEqual = (n: number): Filter => Or(LessThan(n), EqualTo(n));
const MoreThanOrEqual = (n: number): Filter => Or(MoreThan(n), EqualTo(n));
const Interval = (min: number, max: number): Filter => And(MoreThan(min), LessThan(max));
const Outside = (min: number, max: number): Filter => Not(Interval(min, max));
const ClosedLeftInterval = (min: number, max: number): Filter =>
  Or(Interval(min, max), EqualTo(min));
const ClosedRightInterval = (min: number, max: number): Filter =>
  Or(Interval(min, max), EqualTo(max));
const ClosedInterval = (min: number, max: number): Filter =>
  Or(ClosedLeftInterval(min, max), ClosedRightInterval(min, max));

const isEven: Predicate1 = (x) => Number.isInteger(x) && x % 2 === 0;
const isOdd: Predicate1 = (x) => Number.isInteger(x) && !isEven(x);
const isLessThan: Predicate2 = (x, y) => y < x;
const isMoreThan: Predicate2 = (x, y) => x < y;
const isEqualTo: Predicate2 = (x, y) => x === y;

const apply: Apply = (f, x) => {
  switch (f.tag) {
    case "even":
      return isEven(x);
    case "more-than":
      return isMoreThan(f.n, x);
    case "equal-to":
      return isEqualTo(f.n, x);
    case "and":
      return apply(f.f1, x) && apply(f.f2, x);
    case "or":
      return apply(f.f1, x) || apply(f.f2, x);
    case "not":
      return !apply(f.f, x);
    default: {
      const never: never = f;
      throw new Error(`unknown filter ${never}`);
    }
  }
};

const filterStep: FilterStep = (f) => (xs, x) => (apply(f, x) ? [...xs, x] : xs);
const filter: ApplyFilter = (f, l) => l.reduce(filterStep(f), []);

[
  Odd,
  Even,
  LessThan(5),
  MoreThan(5),
  And(Odd, LessThan(6)),
  And(Even, And(MoreThan(1), LessThan(7))),
  Or(Interval(-1, 4), Interval(7, 11)),
  And(Even, And(MoreThan(1), LessThan(7))),
  And(Even, Or(Interval(-1, 4), Interval(7, 11))),
  And(Odd, Or(Interval(-1, 4), Interval(7, 11))),
  Interval(3, 7),
  Outside(3, 7),
  LessThanOrEqual(5),
  MoreThanOrEqual(5),
  ClosedInterval(3, 7),
  ClosedLeftInterval(3, 7),
  ClosedRightInterval(3, 7),
].forEach((f) => {
  const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const result = filter(f, input);
  console.log(JSON.stringify(f));
  console.log(JSON.stringify(input));
  console.log(JSON.stringify(result));
  console.log("------");
});
