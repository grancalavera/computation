// https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf
export {};

type Fold = <A, B>(f: (a: A, b: B) => B, b: B, as: A[]) => B;

const fold: Fold = (f, b, as) => {
  const [head, ...tail] = as;
  if (head === undefined) return b;
  return f(head, fold(f, b, tail));
};

type Arrow<A, B> =
  | { tag: "plus"; f: (a: [number, number]) => number }
  | { tag: "concat"; f: (a: [number, number[]]) => (n: number) => number[] };

const plus = (a: [number, number]): Arrow<number, number> => ({
  tag: "plus",
  f: (a) => {
    const [x, y] = a;
    return x + y;
  },
});

const concat = (a: [number, number[]]): Arrow<[number, number[]], number[]> => ({
  tag: "concat",
  f: (a) => (n) => {
    const [x, l] = a;
    return [n + x, ...l];
  },
});

type Apply = <A, B>(arrow: Arrow<A, B>, a: A) => B;
const apply: Apply = (arrow, a) => {
  switch (arrow.tag) {
    case "plus": {
      const { f } = arrow;
      throw new Error("");
    }
    case "concat": {
      const { f } = arrow;
      throw new Error("");
    }
    default:
      throw new Error("");
  }
};

type FoldArrow = <A, B>(arrow: Arrow<[A, B], B>, b: B, as: A[]) => B;

const sum = (a: number, b: number): number => a + b;
const add = (n: number) => (a: number, b: number[]): number[] => [n + a, ...b];

console.log(fold(sum, 0, [1, 2, 3, 4]));
console.log(fold(add(42), [], [1, 2, 3, 4]));
