import { Fn, ComputationContext, computationContext, Compute } from "./common";

export type Result<T, F> = Ok<T, F> | Fail<T, F>;

type Ok<T, _F> = { kind: "ResultOk"; value: T };
type Fail<_T, F> = { kind: "ResultFail"; failure: F };

export const isOk = <A, F>(r: Result<A, F>): r is Ok<A, F> => r.kind === "ResultOk";
export const isFail = <A, F>(r: Result<A, F>): r is Fail<A, F> => r.kind === "ResultFail";

export const ok = <A, F>(value: A): Result<A, F> => ({
  kind: "ResultOk",
  value,
});

export const fail = <A, F>(failure: F): Result<A, F> => ({
  kind: "ResultFail",
  failure,
});

// Functor
type FMap = <A, B, F>(f: Fn<A, B>) => (a: Result<A, F>) => Result<B, F>;

// Bifunctor
type MapFail = <A, FA, FB>(f: Fn<FA, FB>) => (a: Result<A, FA>) => Result<A, FB>;

// Semigroup
type Concat = <A, F>(al: Result<A, F>) => (ar: Result<A, F>) => Result<A, F>;

// Applicative
type Pure = <A, F>(a: A) => Result<A, F>;
type Ap = <A, B, F>(f: Result<Fn<A, B>, F>) => (a: Result<A, F>) => Result<B, F>;

// Monad
type Join = <A, F>(a: Result<Result<A, F>, F>) => Result<A, F>;
type Bind = <A, F>(a: Result<A, F>) => <B>(f: Fn<A, Result<B, F>>) => Result<B, F>;
type Kleisli = <A, B, F>(
  fa: Fn<A, Result<B, F>>
) => <C>(fb: Fn<B, Result<C, F>>) => (a: A) => Result<C, F>;

export const map: FMap = (f) => (a) => (isFail(a) ? a : ok(f(a.value)));
export const mapFail: MapFail = (f) => (a) => (isOk(a) ? a : fail(f(a.failure)));
export const concat: Concat = (al) => (ar) => (isFail(al) ? ar : al);
export const pure: Pure = ok;
export const ap: Ap = <A, B, F>(f: Result<Fn<A, B>, F>) => (a: Result<A, F>) =>
  isFail(f) ? f : map<A, B, F>(f.value)(a);
export const join: Join = (a) => (isFail(a) ? a : a.value);
export const bind: Bind = (a) => (f) => (isFail(a) ? a : f(a.value));
export const kleisli: Kleisli = (fa) => (fb) => (a) => bind(fa(a))(fb);

type Unwrap = <T, F>(r: Result<T, F>) => T;

class UnwrapError<T, F> extends Error {
  constructor(public failure: Fail<T, F>, message?: string) {
    super(message);
    Object.setPrototypeOf(this, UnwrapError.prototype);
  }
}

export const result = <T, F>(compute: Compute<T, Unwrap>): Result<T, F> => {
  const unwrap: Unwrap = (r) => {
    if (isOk(r)) {
      return r.value;
    }
    throw new UnwrapError(r);
  };

  try {
    const context = computationContext(unwrap);
    const computation = compute(context);
    return ok(computation);
  } catch (e) {
    if (e instanceof UnwrapError) {
      const failure: Fail<T, F> = e.failure;
      return failure;
    } else {
      throw e;
    }
  }
};
