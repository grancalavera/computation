import { ComputationContext, computationContext, Fn, Compute } from "./common";

export type Option<T> = Some<T> | None;

type Some<T> = { kind: "OptionSome"; value: T };
type None = { kind: "OptionNone" };

export const isSome = <T>(o: Option<T>): o is Some<T> => o.kind === "OptionSome";
export const isNone = <T>(o: Option<T>): o is None => o.kind === "OptionNone";

export const some = <T>(value: T): Option<T> => ({ kind: "OptionSome", value });
export const none = <T>(): Option<T> => ({ kind: "OptionNone" });

// Functor
type FMap = <A, B>(f: Fn<A, B>) => (a: Option<A>) => Option<B>;

// Semigroup
type Concat = <A>(al: Option<A>) => (ar: Option<A>) => Option<A>;

// Applicative
type Pure = <A>(o: A) => Option<A>;
type Ap = <A, B>(f: Option<Fn<A, B>>) => (a: Option<A>) => Option<B>;

// Monad
type Join = <A>(a: Option<Option<A>>) => Option<A>;
type Bind = <A>(a: Option<A>) => <B>(f: Fn<A, Option<B>>) => Option<B>;
type Kleisli = <A, B>(
  fa: Fn<A, Option<B>>
) => <C>(fb: Fn<B, Option<C>>) => (a: A) => Option<C>;

export const map: FMap = (f) => (a) => (isNone(a) ? a : some(f(a.value)));
export const concat: Concat = (al) => (ar) => (isNone(al) ? ar : al);
export const pure: Pure = some;
export const ap: Ap = (f) => (a) => (isNone(f) ? f : map(f.value)(a));
export const join: Join = (o) => (isNone(o) ? o : o.value);
export const bind: Bind = (o) => (f) => (isNone(o) ? o : f(o.value));
export const kleisli: Kleisli = (fa) => (fb) => (o) => bind(fa(o))(fb);

type Unwrap = <T>(o: Option<T>) => T;

class UnwrapError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UnwrapError.prototype);
  }
}

export const option = <T>(compute: Compute<T, Unwrap>): Option<T> => {
  const unwrap: Unwrap = (o) => {
    if (isSome(o)) {
      return o.value;
    }
    throw new UnwrapError();
  };

  try {
    const context = computationContext(unwrap);
    const computation = compute(context);
    return some(computation);
  } catch (e) {
    if (e instanceof UnwrapError) {
      return none();
    } else {
      throw e;
    }
  }
};
