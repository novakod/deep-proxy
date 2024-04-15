import { test, expect, vitest } from "vitest";
import { createDeepProxy } from "../../src";

test("Тестирование поля get функции createDeepProxy на простом примере", () => {
  const getSpyFn = vitest.fn<
    [
      {
        target: Record<string | symbol, any>;
        rootTarget: Record<string | symbol, any>;
        key: string | symbol;
        path: (string | symbol)[];
      }
    ]
  >();

  const data = {
    count: 0,
    field: {
      nestedCount: 0,
    },
  };

  const proxifiedData = createDeepProxy(data, {
    get({ target, rootTarget, key, path, reciever }) {
      getSpyFn({
        target,
        rootTarget,
        key,
        path,
      });
      return Reflect.get(target, key, reciever);
    },
  });

  proxifiedData.count;
  expect(getSpyFn).toBeCalledTimes(1);
  expect(getSpyFn.mock.lastCall?.[0]).toEqual({
    target: data,
    rootTarget: data,
    key: "count",
    path: ["count"],
  });

  const field = proxifiedData.field;
  expect(getSpyFn).toBeCalledTimes(2);
  expect(getSpyFn.mock.lastCall?.[0]).toEqual({
    target: data,
    rootTarget: data,
    key: "field",
    path: ["field"],
  });

  field.nestedCount;
  expect(getSpyFn).toBeCalledTimes(3);
  expect(getSpyFn.mock.lastCall?.[0]).toEqual({
    target: data.field,
    rootTarget: data,
    key: "nestedCount",
    path: ["field", "nestedCount"],
  });
});

test("Тестирование поля get функции createDeepProxy на массиве", () => {
  const getSpyFn = vitest.fn<
    [
      {
        target: Record<string | symbol, any>;
        rootTarget: Record<string | symbol, any>;
        key: string | symbol;
        path: (string | symbol)[];
      }
    ]
  >();

  const data = {
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  };

  const proxifiedData = createDeepProxy(data, {
    get({ target, rootTarget, key, path, reciever }) {
      getSpyFn({
        target,
        rootTarget,
        key,
        path,
      });
      return Reflect.get(target, key, reciever);
    },
  });

  proxifiedData.numbers;
  expect(getSpyFn).toBeCalledTimes(1);
  expect(getSpyFn.mock.lastCall?.[0]).toEqual({
    target: data,
    rootTarget: data,
    key: "numbers",
    path: ["numbers"],
  });

  proxifiedData.numbers.shift();
  console.log(getSpyFn.mock.calls);
  // Из-за особенности работы метода shift у массива, который перезаписывает n-й элемент
  // массива n+1-ым и удаляет последний функция getSpyFn вызывается 14 раз:
  // 1 раз для прочления поля numbers, 1 раз для прочтения метода shift, 1 раз для прочтения поля length
  // и 10 раз для прочтения каждого элемента массива
  expect(getSpyFn).toBeCalledTimes(14);
});
