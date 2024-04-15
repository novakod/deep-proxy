import { test, expect, vitest } from "vitest";
import { createDeepProxy } from "../../src";

test("Тестирование поля deleteProperty функции createDeepProxy на простом примере", () => {
  const deletePropertySpyFn = vitest.fn<
    [
      {
        target: Record<string | symbol, any>;
        rootTarget: Record<string | symbol, any>;
        key: string | symbol;
        path: (string | symbol)[];
      }
    ]
  >();

  const data: {
    count?: number;
    field: {
      nestedCount?: number;
      numbers: number[];
    };
  } = {
    count: 0,
    field: {
      nestedCount: 0,
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  };

  const proxifiedData = createDeepProxy(data, {
    deleteProperty({ target, key, path, rootTarget }) {
      deletePropertySpyFn({ target, rootTarget, key, path });
      return Reflect.deleteProperty(target, key);
    },
  });

  delete proxifiedData.count;
  expect(deletePropertySpyFn).toBeCalledTimes(1);
  expect(deletePropertySpyFn.mock.lastCall?.[0]).toEqual({
    target: data,
    rootTarget: data,
    key: "count",
    path: ["count"],
  });

  delete proxifiedData.field.nestedCount;
  expect(deletePropertySpyFn).toBeCalledTimes(2);
  expect(deletePropertySpyFn.mock.lastCall?.[0]).toEqual({
    target: data.field,
    rootTarget: data,
    key: "nestedCount",
    path: ["field", "nestedCount"],
  });

  proxifiedData.field.numbers.pop();
  expect(deletePropertySpyFn).toBeCalledTimes(3);
  expect(deletePropertySpyFn.mock.lastCall?.[0]).toEqual({
    target: data.field.numbers,
    rootTarget: data,
    key: "9",
    path: ["field", "numbers", "9"],
  });
  expect(data.field.numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  proxifiedData.field.numbers.shift();
  expect(deletePropertySpyFn).toBeCalledTimes(4);
  expect(deletePropertySpyFn.mock.lastCall?.[0]).toEqual({
    target: data.field.numbers,
    rootTarget: data,
    // Из-за особенности работы метода shift у массива, удаляется последний элемент, индекс которго здесь равен 8
    // При этом n-ый элемент перезаписывается n+1-ым
    key: "8",
    path: ["field", "numbers", "8"],
  });
  expect(data.field.numbers).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
});
