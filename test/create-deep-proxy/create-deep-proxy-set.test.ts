import { test, expect, vitest } from "vitest";
import { createDeepProxy } from "../../src";

test("Тестирование поля set функции createDeepProxy на простом примере", () => {
  const setSpyFn = vitest.fn<
    [
      {
        target: Record<string | symbol, any>;
        rootTarget: Record<string | symbol, any>;
        key: string | symbol;
        value: any;
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
    set({ target, rootTarget, key, path, value, reciever }) {
      setSpyFn({
        target,
        rootTarget,
        key,
        value,
        path,
      });
      return Reflect.set(target, key, value, reciever);
    },
  });

  proxifiedData.count = 1;
  expect(setSpyFn).toBeCalledTimes(1);
  expect(setSpyFn.mock.lastCall?.[0]).toEqual({
    target: data,
    rootTarget: data,
    key: "count",
    value: 1,
    path: ["count"],
  });

  proxifiedData.count += 1;
  expect(setSpyFn).toBeCalledTimes(2);
  expect(setSpyFn.mock.lastCall?.[0]).toEqual({
    target: data,
    rootTarget: data,
    key: "count",
    value: 2,
    path: ["count"],
  });

  proxifiedData.field.nestedCount = 1;
  expect(setSpyFn).toBeCalledTimes(3);
  expect(setSpyFn.mock.lastCall?.[0]).toEqual({
    target: data.field,
    rootTarget: data,
    key: "nestedCount",
    value: 1,
    path: ["field", "nestedCount"],
  });
});

test("Тестирование полей set функции createDeepProxy на массиве", () => {
  const setSpyFn = vitest.fn<
    [
      {
        target: Record<string | symbol, any>;
        rootTarget: Record<string | symbol, any>;
        key: string | symbol;
        value: any;
        path: (string | symbol)[];
      }
    ]
  >();

  const now = new Date();
  const data = {
    users: [
      {
        id: 0,
        name: "Ann",
        birthday: now,
      },
    ],
  };

  const proxifiedData = createDeepProxy(data, {
    set({ target, rootTarget, key, path, value, reciever }) {
      setSpyFn({
        target,
        rootTarget,
        key,
        value,
        path,
      });
      return Reflect.set(target, key, value, reciever);
    },
  });

  const now2 = new Date();
  proxifiedData.users[0].birthday = now2;
  expect(setSpyFn).toBeCalledTimes(1);
  expect(setSpyFn.mock.lastCall?.[0]).toEqual({
    target: data.users[0],
    rootTarget: data,
    key: "birthday",
    value: now2,
    path: ["users", "0", "birthday"],
  });

  proxifiedData.users[0].birthday.setFullYear(2022);
  expect(setSpyFn).toBeCalledTimes(1);
});
