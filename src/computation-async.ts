import { isRight } from "fp-ts/lib/Either";
import { TaskEither, tryCatchK } from "fp-ts/lib/TaskEither";
import { UnwrapError } from "./computation";

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
