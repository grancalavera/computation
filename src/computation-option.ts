import { Monad } from "fp-ts/lib/Monad";
import { isNone, none, Option, tryCatch, option } from "fp-ts/lib/Option";
import { UnwrapError } from "./computation";
import { HKT } from "fp-ts/lib/HKT";

export const optionComputation = <T>(
  run: (context: { $: <U>(mu: Option<U>) => U }) => T
): Option<T> => {
  const unwrap = <A>(ma: Option<A>) => {
    const result = option.chain(ma, (a) => {
      return option.of(a);
    });

    if (isNone(result)) {
      throw new UnwrapError(result);
    } else {
      return result.value;
    }
  };

  return tryCatch(() => run({ $: unwrap }));
};

export const getComputation = <M>(M: Monad<M>) => {
  const unwrap = <A>(ma: HKT<M, A>): A => {
    let unwrapped: A | undefined;

    const error = M.chain(ma, (a) => {
      unwrapped = a;
      return M.of(a);
    });

    if (unwrapped === undefined) {
      throw new UnwrapError(error);
    } else {
      return unwrapped;
    }
  };
};
