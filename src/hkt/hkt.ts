// see: https://medium.com/@gcanti/higher-kinded-types-in-typescript-static-and-fantasy-land-d41c361d0dbe
// see: https://github.com/fantasyland/static-land
// see: https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf

/** HKT */
export interface HKT<F, A> {
  _URI: F;
  _A: A;
}

// see: https://www.staging-typescript.org/docs/handbook/declaration-merging.html#module-augmentation
export interface URI2HKT<A> {}
export type URIS = keyof URI2HKT<any>;
export type Type<URI extends URIS, A> = URI2HKT<A>[URI];
