// https://blog.sigplan.org/2019/12/30/defunctionalization-everybody-does-it-nobody-talks-about-it/

export {};

type Filter =
  | { tag: "odd" }
  | { tag: "even" }
  | { tag: "less-than"; n: number }
  | { tag: "more-than"; n: number }
  | { tag: "and"; f1: Filter; f2: Filter };

type Predicate1 = (x: number) => boolean;
type Predicate2 = (x: number, y: number) => boolean;

type Apply = (f: Filter, x: number) => boolean;

const Even: Filter = { tag: "even" };
const Odd: Filter = { tag: "odd" };
const LessThan = (n: number): Filter => ({ tag: "less-than", n });
const MoreThan = (n: number): Filter => ({ tag: "more-than", n });
const And = (f1: Filter, f2: Filter): Filter => ({ tag: "and", f1, f2 });

const isInteger: Predicate1 = Number.isInteger.bind(Number);
const isEven: Predicate1 = (x) => isInteger(x) && x % 2 === 0;
const isOdd: Predicate1 = (x) => isInteger(x) && !isEven(x);
const isLessThan: Predicate2 = (x, y) => y < x;
const isMoreThan: Predicate2 = (x, y) => x < y;

const apply: Apply = (f, x) => {
  switch (f.tag) {
    case "even":
      return isEven(x);
    case "odd":
      return isOdd(x);
    case "less-than":
      return isLessThan(f.n, x);
    case "more-than":
      return isMoreThan(f.n, x);
    case "and":
      return apply(f.f1, x) && apply(f.f2, x);
    default: {
      const never: never = f;
      throw new Error(`unknown filter ${never}`);
    }
  }
};

const filter = (f: Filter, l: number[]): number[] => {
  const [x, ...xs] = l;
  if (x === undefined) return [];
  return apply(f, x) ? [x, ...filter(f, xs)] : filter(f, xs);
};

console.log(filter(Odd, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(filter(Even, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(filter(LessThan(5), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(filter(MoreThan(5), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(filter(And(Odd, LessThan(6)), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
console.log(
  filter(And(Even, And(MoreThan(1), LessThan(7))), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
);

// All told, here’s the general procedure for defunctionalization:
//    1.  Collect all functions passed as an argument to the filter function.
//    2.  Create a data type, with one variant for each possible function,
//        each with fields to store the free variables referenced by the
//        corresponding function.
//    3.  Replace the invocation of the filter condition with an apply
//        function, which determines what filter condition the data structure
//        represents, and executes it.
