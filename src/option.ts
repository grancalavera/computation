import { isSome, none, Option, some } from "fp-ts/lib/Option";

class UnwrapError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, UnwrapError.prototype);
  }
}

export interface ComputationContext<Unwrap> {
  unwrap: Unwrap;
  $: Unwrap;
}

type Unwrap = <T>(o: Option<T>) => T;

export type Compute<T, Unwrap> = (context: ComputationContext<Unwrap>) => T;

export const computationContext = <Unwrap>(
  unwrap: Unwrap
): ComputationContext<Unwrap> => ({
  unwrap,
  $: unwrap,
});

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
      return none;
    } else {
      throw e;
    }
  }
};
