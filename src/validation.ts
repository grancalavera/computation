// https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja

import { sequenceT } from "fp-ts/lib/Apply";
import { Either, getValidation, left, map, right } from "fp-ts/lib/Either";
import { getSemigroup, NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/pipeable";

const minLength = (s: string): Either<NonEmptyArray<string>, string> =>
  s.length >= 6 ? right(s) : left(["at least 6 characters"]);

const oneCapital = (s: string): Either<NonEmptyArray<string>, string> =>
  /[A-Z]/g.test(s) ? right(s) : left(["at least one capital letter"]);

const oneNumber = (s: string): Either<NonEmptyArray<string>, string> =>
  /[0-9]/g.test(s) ? right(s) : left(["at least one number"]);

// because you need to know how to sum up the validation errors
// semigroup will sum up stuff in a `NonEmptyArray<A>`, which in
// this case is specialised to be `A = string`
//
// for a given application this can be done in a single place, and
// a single validation error can be used, or one that can be summed
// in the same way
const validation = getValidation(getSemigroup<string>());
const seqValidation = sequenceT(validation);

function validatePassword(s: string): Either<NonEmptyArray<string>, string> {
  return pipe(
    // first run all the validations
    seqValidation(minLength(s), oneCapital(s), oneNumber(s)),
    // if we get here we use the identity map and return the argument unchanged
    // we could produce a "ValidatedPassword" type as well.
    map(() => s)
  );
}

console.log("--------------------------------------------------------------------------");
console.log("");
console.log("validation");
console.log("");
console.log("--------------------------------------------------------------------------");
console.log(validatePassword("ab"));
console.log(validatePassword("abcdef"));
console.log(validatePassword("Abcdef"));
console.log(validatePassword("Abcdef0"));
