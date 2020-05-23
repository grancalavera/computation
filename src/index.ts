// Before going much further read this
// https://medium.com/@gcanti/higher-kinded-types-in-typescript-static-and-fantasy-land-d41c361d0dbe
// https://github.com/gcanti/fp-ts
// https://gcanti.github.io/fp-ts/

import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { left as leftT, right as rightT, TaskEither } from "fp-ts/lib/TaskEither";
import {
  eitherComputation,
  optionComputation,
  taskEitherComputation,
} from "./computation";

type OptionWorkflow = (s: Option<string>, n: Option<number>) => Option<number>;

type EitherWorkflow = (
  s: Either<number, string>,
  n: Either<number, number>
) => Either<number, number>;

type TaskEitherWorkflow = (
  s: TaskEither<number, string>,
  n: TaskEither<number, number>
) => TaskEither<number, number>;

const optionWorkflow: OptionWorkflow = (s, n) =>
  optionComputation(({ $ }) => {
    const x = $(s);
    const y = $(n);
    return x.split("").length * y;
  });

const eitherWorkflow: EitherWorkflow = (s, n) =>
  eitherComputation(({ $ }) => {
    const x = $(s);
    const y = $(n);
    return x.split("").length * y;
  });

const sequentialTaskEitherWorkflow: TaskEitherWorkflow = (s, n) =>
  taskEitherComputation(async ({ $ }) => {
    const x = await $(s);
    const y = await $(n);
    return x.split("").length * y;
  });

const parallelTaskEitherWorkflow: TaskEitherWorkflow = (s, n) =>
  taskEitherComputation(async ({ $ }) => {
    const [x, y] = await Promise.all([$(s), $(n)]);
    return x.split("").length * y;
  });

const goodStringOption: Option<string> = some("good");
const goodNumberOption: Option<number> = some(42);
const badStringOption: Option<string> = none;
const badNumberOption: Option<number> = none;

const goodStringResult: Either<number, string> = right("good");
const goodNumberResult: Either<number, number> = right(42);
const badStringResult: Either<number, string> = left(1);
const badNumberResult: Either<number, number> = left(2);

const goodStringTaskE: TaskEither<number, string> = rightT("good");
const goodNumberTaskE: TaskEither<number, number> = rightT(42);
const badStringTaskE: TaskEither<number, string> = leftT(1);
const badNumberTaskE: TaskEither<number, number> = leftT(2);

console.log(optionWorkflow(goodStringOption, goodNumberOption));
console.log(optionWorkflow(goodStringOption, badNumberOption));
console.log(optionWorkflow(badStringOption, goodNumberOption));
console.log(optionWorkflow(badStringOption, badNumberOption));

console.log(eitherWorkflow(goodStringResult, goodNumberResult));
console.log(eitherWorkflow(goodStringResult, badNumberResult));
console.log(eitherWorkflow(badStringResult, goodNumberResult));
console.log(eitherWorkflow(badStringResult, badNumberResult));

async function runAsyncWorkflows() {
  console.log(await sequentialTaskEitherWorkflow(goodStringTaskE, goodNumberTaskE)());
  console.log(await sequentialTaskEitherWorkflow(goodStringTaskE, badNumberTaskE)());
  console.log(await sequentialTaskEitherWorkflow(badStringTaskE, goodNumberTaskE)());
  console.log(await sequentialTaskEitherWorkflow(badStringTaskE, badNumberTaskE)());

  console.log(await parallelTaskEitherWorkflow(goodStringTaskE, goodNumberTaskE)());
  console.log(await parallelTaskEitherWorkflow(goodStringTaskE, badNumberTaskE)());
  console.log(await parallelTaskEitherWorkflow(badStringTaskE, goodNumberTaskE)());
  console.log(await parallelTaskEitherWorkflow(badStringTaskE, badNumberTaskE)());
}

runAsyncWorkflows();
