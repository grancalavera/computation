// Before going much further read this
// https://medium.com/@gcanti/higher-kinded-types-in-typescript-static-and-fantasy-land-d41c361d0dbe
// https://github.com/gcanti/fp-ts
// https://gcanti.github.io/fp-ts/

import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { asyncResultC, optionC, resultC } from "./computation";

const goodStringOption: Option<string> = some("good");
const goodNumberOption: Option<number> = some(42);
const badStringOption: Option<string> = none;
const badNumberOption: Option<number> = none;

const goodStringResult: Either<number, string> = right("good");
const goodNumberResult: Either<number, number> = right(42);
const badStringResult: Either<number, string> = left(1);
const badNumberResult: Either<number, number> = left(2);

const goodStringTaskE: TaskEither<number, string> = TE.right("good");
const goodNumberTaskE: TaskEither<number, number> = TE.right(42);
const badStringTaskE: TaskEither<number, string> = TE.left(1);
const badNumberTaskE: TaskEither<number, number> = TE.left(2);

const optionWorkflow = (s: Option<string>, n: Option<number>): Option<number> =>
  optionC(({ $ }) => {
    const x = $(s);
    const y = $(n);
    return x.split("").length * y;
  });

const resultWorkflow = (
  s: Either<number, string>,
  n: Either<number, number>
): Either<number, number> =>
  resultC(({ $ }) => {
    const x = $(s);
    const y = $(n);
    return x.split("").length * y;
  });

const asyncWorkflow = (
  s: TaskEither<number, string>,
  n: TaskEither<number, number>,
  f: Service<number, string>
): TaskEither<number, number> =>
  asyncResultC(async ({ $ }) => {
    const x = await $(s);
    const y = await $(n);
    const z = await $(f("foo"));

    return (
      x.split("").length * y +
      z
        .split("")
        .map((c) => c.charCodeAt(0))
        .reduce((a, b) => a + b, 0)
    );
  });

console.log(optionWorkflow(goodStringOption, goodNumberOption));
console.log(optionWorkflow(goodStringOption, badNumberOption));
console.log(optionWorkflow(badStringOption, goodNumberOption));
console.log(optionWorkflow(badStringOption, badNumberOption));

console.log(resultWorkflow(goodStringResult, goodNumberResult));
console.log(resultWorkflow(goodStringResult, badNumberResult));
console.log(resultWorkflow(badStringResult, goodNumberResult));
console.log(resultWorkflow(badStringResult, badNumberResult));

type Service<E, A> = (url: string) => TaskEither<E, A>;
const alwaysService: Service<number, string> = (url: string) =>
  TE.right(`always: ${url}`);
const neverService: Service<number, string> = (url: string) => TE.left(500);

async function runAsyncWorkflows() {
  console.log(await asyncWorkflow(goodStringTaskE, goodNumberTaskE, alwaysService)());
  console.log(await asyncWorkflow(goodStringTaskE, badNumberTaskE, neverService)());
  console.log(await asyncWorkflow(badStringTaskE, goodNumberTaskE, neverService)());
  console.log(await asyncWorkflow(badStringTaskE, badNumberTaskE, neverService)());
}

runAsyncWorkflows();
