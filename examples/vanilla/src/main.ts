import { createDeepProxy } from "lib";

const data = {
  users: [
    {
      id: 1,
      name: "Ann",
      friends: [
        {
          id: 2,
          name: "John",
        },
      ],
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "John",
      friends: [],
      createdAt: new Date(),
    },
  ],
  usersCount: 2,
};

const proxifiedData = createDeepProxy(data, {
  get({ key, target }) {
    return target[key];
  },
  set({ key, nestedKeys, target, value }) {
    target[key] = value;
    console.log("proxified set", key, nestedKeys, target, value);

    return true;
  },
});

proxifiedData.users[0].friends.push({ id: 3, name: "Jane" });
proxifiedData.users.push({ id: 3, name: "Jane", friends: [], createdAt: new Date() });
proxifiedData.usersCount = 3;
