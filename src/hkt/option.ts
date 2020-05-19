import { Functor } from "./functor";

export const URI = "Option";
export type URI = typeof URI;

// https://www.staging-typescript.org/docs/handbook/declaration-merging.html#module-augmentation
declare module "./hkt" {
  interface URI2HKT<A> {
    Option: Option<A>;
  }
}

export interface None {
  readonly _tag: "None";
}

export interface Some<A> {
  readonly _tag: "Some";
  readonly value: A;
}

export type Option<A> = None | Some<A>;

export const none: Option<never> = { _tag: "None" };
export const some = <A>(a: A): Option<A> => ({ _tag: "Some", value: a });
export const isNone = <A>(fa: Option<A>): fa is None => fa._tag === "None";
export const isSome = <A>(fa: Option<A>): fa is Some<A> => fa._tag === "Some";

const option: Functor<URI> = {
  map: (f, ma) => (isNone(ma) ? ma : some(f(ma.value))),
};

const x = option.map<number, number>((x) => x * 2, none);
