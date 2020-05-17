export type Fn<A, B> = (a: A) => B;

export interface ComputationContext<Unwrap> {
  unwrap: Unwrap;
  $: Unwrap;
}

export type Compute<T, Unwrap> = (context: ComputationContext<Unwrap>) => T;

export const computationContext = <Unwrap>(
  unwrap: Unwrap
): ComputationContext<Unwrap> => ({
  unwrap,
  $: unwrap,
});
