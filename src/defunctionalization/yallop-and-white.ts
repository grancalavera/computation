// https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf
export {};

type Fold = <A, B>(f: (a: A, b: B) => B, b: B, as: A[]) => B;

type Crush1<A, B> = (a: A, b: B) => B;
type Crush2<E, A, B> = (x: E) => Crush1<A, B>;

const fold: Fold = (f, b, as) => {
  const [head, ...tail] = as;
  if (head === undefined) return b;
  return f(head, fold(f, b, tail));
};

const sum: Crush1<number, number> = (a, b) => a + b;
const add: Crush2<number, number, number[]> = (x) => (a, b) => [x + a, ...b];

console.log(fold(sum, 0, [1, 2, 3, 4]));
console.log(fold(add(42), [], [1, 2, 3, 4]));
