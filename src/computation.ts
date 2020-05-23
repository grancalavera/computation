import { Either, either } from "fp-ts/lib/Either";
import { Option, option } from "fp-ts/lib/Option";
import { TaskEither, taskEither, tryCatchK } from "fp-ts/lib/TaskEither";

type Compute<T, Unwrap> = (context: ComputationContext<Unwrap>) => T;

interface ComputationContext<Unwrap> {
  $: Unwrap;
}

export const computationContext = <Unwrap>(
  unwrap: Unwrap
): ComputationContext<Unwrap> => ({
  $: unwrap,
});

class UnwrapError extends Error {
  constructor(public readonly error: any) {
    super();
    Object.setPrototypeOf(this, UnwrapError.prototype);
  }
}

type UnwrapOption = <T>(o: Option<T>) => T;

export const optionC = <T>(compute: Compute<T, UnwrapOption>): Option<T> => {
  let monad = option;

  const unwrap: UnwrapOption = <A>(ma: Option<A>) => {
    let unwrapped: A | undefined;

    const result = monad.chain(ma, (a) => {
      unwrapped = a;
      return monad.of(a);
    });

    if (unwrapped === undefined) {
      throw new UnwrapError(result);
    } else {
      return unwrapped;
    }
  };

  try {
    const context = computationContext(unwrap);
    return monad.of(compute(context));
  } catch (e) {
    if (e instanceof UnwrapError) {
      return e.error;
    } else {
      throw e;
    }
  }
};

type UnwrapEither = <T, F>(r: Either<F, T>) => T;

export const resultC = <F, T>(compute: Compute<T, UnwrapEither>): Either<F, T> => {
  let monad = either;

  const unwrap: UnwrapEither = <F, A>(ma: Either<F, A>) => {
    let unwrapped: A | undefined;

    const result = monad.chain(ma, (a) => {
      unwrapped = a;
      return monad.of(a);
    });

    if (unwrapped === undefined) {
      throw new UnwrapError(result);
    } else {
      return unwrapped;
    }
  };

  try {
    const context = computationContext(unwrap);
    return monad.of(compute(context));
  } catch (e) {
    if (e instanceof UnwrapError) {
      return e.error;
    } else {
      throw e;
    }
  }
};

type UnwrapTaskEither = <F, T>(r: TaskEither<F, T>) => Promise<T>;
type AsyncCompute<T> = (context: ComputationContext<UnwrapTaskEither>) => Promise<T>;

export const asyncResultC = <F, T>(compute: AsyncCompute<T>): TaskEither<F, T> => {
  const monad = taskEither;

  const unwrap: UnwrapTaskEither = async <F, A>(ma: TaskEither<F, A>) => {
    let unwrapped: A | undefined;

    const result = monad.chain(ma, (a) => {
      unwrapped = a;
      return monad.of(a);
    });

    const resultEither = await result();

    if (unwrapped === undefined) {
      throw new UnwrapError(resultEither);
    } else {
      return unwrapped;
    }
  };

  const asyncCompute = tryCatchK<F, [], T>(
    () => {
      const context = computationContext(unwrap);
      return compute(context);
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
