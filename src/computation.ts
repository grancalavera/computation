import { Either, isRight, tryCatch as tryCatchE } from "fp-ts/lib/Either";
import { isNone, none, Option, tryCatch as tryCatchO } from "fp-ts/lib/Option";
import { TaskEither, tryCatchK } from "fp-ts/lib/TaskEither";

class UnwrapError extends Error {
  constructor(public readonly error: any) {
    super();
    Object.setPrototypeOf(this, UnwrapError.prototype);
  }
}

export const optionComputation = <T>(
  run: (context: { $: <U>(mu: Option<U>) => U }) => T
): Option<T> => {
  const unwrap = <A>(ma: Option<A>) => {
    if (isNone(ma)) {
      throw new UnwrapError(none);
    } else {
      return ma.value;
    }
  };

  return tryCatchO(() => run({ $: unwrap }));
};

export const eitherComputation = <F, T>(
  compute: (run: { $: <U>(mu: Either<F, U>) => U }) => T
): Either<F, T> => {
  const unwrap = <F, A>(ma: Either<F, A>) => {
    if (isRight(ma)) {
      return ma.right;
    } else {
      throw new UnwrapError(ma.left);
    }
  };

  return tryCatchE<F, T>(
    () => compute({ $: unwrap }),
    (e) => {
      if (e instanceof UnwrapError) {
        return e.error;
      } else {
        throw e;
      }
    }
  );
};

export const taskEitherComputation = <F, T>(
  run: (context: { $: <U>(mu: TaskEither<F, U>) => Promise<U> }) => Promise<T>
): TaskEither<F, T> => {
  const unwrap = async <A>(ma: TaskEither<F, A>) => {
    const result = await ma();

    if (isRight(result)) {
      return result.right;
    } else {
      throw new UnwrapError(result.left);
    }
  };

  const asyncCompute = tryCatchK<F, [], T>(
    () => {
      return run({ $: unwrap });
    },
    (e) => {
      if (e instanceof UnwrapError) {
        return e.error;
      } else {
        throw e;
      }
    }
  );

  return asyncCompute();
};
