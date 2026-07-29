import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
const listPoetryBattles = createServerFn({
  method: "GET"
}).inputValidator((input) => input ?? {
  scope: "active"
}).handler(createSsrRpc("504e142cdc51dc62a074486e594ede5de4ba6cae1788134a6b1555b9b766bf20"));
const getPoetryBattle = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("2df76ac4651f7ee09e175ef1f8d2135014a5ba67b9fb26911dfc0354c2cf886b"));
export {
  getPoetryBattle as g,
  listPoetryBattles as l
};
