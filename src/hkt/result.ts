import { Functor } from "./functor";

export const URI = "Result";
export type URI = typeof URI;

declare module "./hkt" {
  interface URI2HKT<A> {}
}

export class Fail<A, E> {
  readonly _URI!: URI;
  readonly _A!: never;
  readonly _E!: E;
  readonly tag: "Fail" = "Fail";
  constructor(readonly error: E) {}
}
