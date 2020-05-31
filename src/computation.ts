import { either } from "fp-ts/lib/Either";
import { HKT, Kind, Kind2, URIS, URIS2 } from "fp-ts/lib/HKT";
import { Monad, Monad1, Monad2 } from "fp-ts/lib/Monad";
import { option } from "fp-ts/lib/Option";
import { reader } from "fp-ts/lib/Reader";
import { state } from "fp-ts/lib/State";

export const optionComputation = buildComputation(option);
export const eitherComputation = buildComputation(either);
export const readerComputation = buildComputation(reader);
export const stateComputation = buildComputation(state);

export class UnwrapError extends Error {
  constructor(public readonly error: any) {
    super();
    Object.setPrototypeOf(this, UnwrapError.prototype);
  }
}

// * -> * -> *
// prettier-ignore
export function buildComputation<M extends URIS2>(M: Monad2<M>): <E, T>(run: (ctx: { $: <U>(mu: Kind2<M, E, U>) => U }) => T) => Kind2<M, E, T>;
// * -> *
// prettier-ignore
export function buildComputation<M extends URIS>(M: Monad1<M>): <T>(run: (ctx: { $: <U>(mu: Kind<M, U>) => U }) => T) => Kind<M, T>;
// for all
// prettier-ignore
export function buildComputation<M>(M: Monad<M>): <T>(run: (ctx: { $: <U>(mu: HKT<M, U>) => U }) => T) => HKT<M, T> {
  return (run) => {

    const unwrap = <U>(mu: HKT<M, U>): U => {
      let unwrapped: U | undefined;

      const error = M.chain(mu, (u) => {
        unwrapped = u;
        return M.of(u);
      });

      if (unwrapped === undefined) {
        throw new UnwrapError(error);
      } else {
        return unwrapped;
      }
    };

    try {
      return M.of(run({ $: unwrap }));
    } catch (e) {
      if (e instanceof UnwrapError) {
        return e.error;
      } else {
        throw e;
      }
    }
  };
}
