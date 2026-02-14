import { createQueryKeys } from "@lukemorales/query-key-factory";

const userQueryKeys = createQueryKeys("user", {
  loggedInUser: null,
});

export { userQueryKeys };
