import { Functor1, Functor, Functor2 } from "fp-ts/lib/Functor";
import { HKT, URIS2, Kind2, URIS, Kind } from "fp-ts/lib/HKT";
import { right, either, left } from "fp-ts/lib/Either";

export const URI = "Identity";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly Identity: Identity<A>;
  }
}

export type Identity<A> = A;

export const identity: Functor1<URI> = {
  URI,
  map: (ma, f) => f(ma),
};

// prettier-ignore
export function lift<F extends URIS2>(F: Functor2<F>): <A, B>(f: (a: A) => B) => <E>(fa: Kind2<F, E, A>) => Kind2<F, E, B>;
// prettier-ignore
export function lift<F extends URIS>(F: Functor1<F>): <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>;
// prettier-ignore
export function lift<F>(F: Functor<F>): <A, B>(f: (a: A) => B) => (fa: HKT<F, A>) => HKT<F, B> {
  return (f) => (fa) => F.map(fa, f);
}

const double = (n: number): number => n * 2;
const doubleIdentity = lift(identity)(double);
const doubleEither = lift(either)(double);

const r = right(200);
const l = left("can't do that");

console.log(doubleIdentity(500));
console.log(doubleEither(r));
console.log(doubleEither(l));
