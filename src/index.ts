// Before going much further read this
// https://medium.com/@gcanti/higher-kinded-types-in-typescript-static-and-fantasy-land-d41c361d0dbe
// https://github.com/gcanti/fp-ts
// https://gcanti.github.io/fp-ts/

import { Result, result, ok, fail } from "./result";
import { Option, some, none, option } from "./option";

const resultWorkflow = (
  s: Result<string, number>,
  n: Result<number, number>
): Result<number, number> =>
  result(({ $ }) => {
    const x = $(s);
    const y = $(n);
    return x.split("").length * y;
  });

const goodStringResult: Result<string, number> = ok("good");
const goodNumberResult: Result<number, number> = ok(42);
const badStringResult: Result<string, number> = fail(1);
const badNumberResult: Result<number, number> = fail(2);

console.log(resultWorkflow(goodStringResult, goodNumberResult));
console.log(resultWorkflow(goodStringResult, badNumberResult));
console.log(resultWorkflow(badStringResult, goodNumberResult));
console.log(resultWorkflow(badStringResult, badNumberResult));

const goodStringOption: Option<string> = some("good");
const goodNumberOption: Option<number> = some(42);
const badStringOption: Option<string> = none();
const badNumberOption: Option<number> = none();

const optionWorkflow = (s: Option<string>, n: Option<number>): Option<number> =>
  option(({ $ }) => {
    const x = $(s);
    const y = $(n);
    return x.split("").length * y;
  });

console.log(optionWorkflow(goodStringOption, goodNumberOption));
console.log(optionWorkflow(goodStringOption, badNumberOption));
console.log(optionWorkflow(badStringOption, goodNumberOption));
console.log(optionWorkflow(badStringOption, badNumberOption));
