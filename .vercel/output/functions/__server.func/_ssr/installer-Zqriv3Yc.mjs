import { s as supabase } from "./client-H8IXbXWR.mjs";
function detectInstallMode() {
  if (typeof window === "undefined") return "cloud";
  const host = window.location.hostname;
  if (host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com") || host.endsWith(".lovableproject-dev.com") || host === "localhost") {
    return "cloud";
  }
  return "self_hosted";
}
async function fetchInstallStatus() {
  const { data, error } = await supabase.rpc("get_install_status");
  if (error) return { installed: false };
  return data ?? { installed: false };
}
async function completeInstallation(payload) {
  const { data, error } = await supabase.rpc("complete_installation", { _payload: payload });
  if (error) throw error;
  return data;
}
async function resetInstallation() {
  const { error } = await supabase.rpc("reset_installation");
  if (error) throw error;
}
async function bootstrapFirstAdmin() {
  const { error } = await supabase.rpc("bootstrap_first_admin");
  if (error) throw error;
}
export {
  bootstrapFirstAdmin as b,
  completeInstallation as c,
  detectInstallMode as d,
  fetchInstallStatus as f,
  resetInstallation as r
};
