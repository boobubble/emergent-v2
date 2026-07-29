import { c as createSsrRpc } from "./createSsrRpc-wK30bc3J.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
const adminListMehfilCategories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4203299a488f60fcbb2c326c9e3f6ec2ea73278d1dd943478fde676b9a7e49a0"));
const adminSaveMehfilCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("a2f929369bb0708245c185ee1805e9cd2fcbd15c4fc6fd1e7bc03489c2d763a2"));
const adminDeleteMehfilCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("927c66e22ecbedb001a6422b977d58904933d3a455813d5f44e035315fdb9ae9"));
const adminListMehfilPoems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input ?? {}).handler(createSsrRpc("2c4e5a7276ff44da8901e7453cf2a76b2f5b71700f1ad3e844aedaf3f643439b"));
const adminUpdatePoem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("6abf9e5e63ee6d79b3acffeaa0fd827903c1e6308bb4e410ee0998f8c01576b2"));
const adminDeletePoem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("91b9ff5f7a1698b4ddda6fa1bca1a0f13419913f7252b076d45f1f0acbabd839"));
const getMehfilSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("e7ed242c39ec13f8d3aa7910ec2539ecc7043f67718d34ee659cd614f21741b2"));
const adminSaveMehfilSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("9a7e53946f9cdf4c20b47f0abd0c10c8e6ef2aefe9990cef418b5448f86a1eb6"));
export {
  adminListMehfilPoems as a,
  adminUpdatePoem as b,
  adminDeletePoem as c,
  adminListMehfilCategories as d,
  adminSaveMehfilCategory as e,
  adminDeleteMehfilCategory as f,
  getMehfilSettings as g,
  adminSaveMehfilSettings as h
};
