import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
const Ctx = reactExports.createContext(null);
function CommunityProvider({
  community,
  isOwner,
  isMember,
  children
}) {
  const navigate = useNavigate();
  const [pendingExit, setPendingExit] = reactExports.useState(null);
  const exitCommunity = reactExports.useCallback(
    (to = "/") => {
      navigate({ to });
    },
    [navigate]
  );
  const confirmExit = reactExports.useCallback(() => {
    const target = pendingExit;
    setPendingExit(null);
    if (target) navigate({ to: target });
  }, [pendingExit, navigate]);
  const cancelExit = reactExports.useCallback(() => setPendingExit(null), []);
  const value = reactExports.useMemo(
    () => ({
      community,
      communityId: community.id,
      slug: community.slug,
      accent: community.accent_color || "#7c3aed",
      isOwner,
      isMember,
      exitCommunity,
      pendingExit,
      setPendingExit,
      confirmExit,
      cancelExit
    }),
    [community, isOwner, isMember, exitCommunity, pendingExit, confirmExit, cancelExit]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value, children });
}
function useCommunity() {
  const v = reactExports.useContext(Ctx);
  if (!v) throw new Error("useCommunity must be used inside a community route");
  return v;
}
export {
  CommunityProvider as C,
  useCommunity as u
};
