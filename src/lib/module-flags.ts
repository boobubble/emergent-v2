export interface CoreModuleFlags {
  communities: boolean;
  blog: boolean;
  pages: boolean;
}

export const CORE_MODULE_DEFAULTS: CoreModuleFlags = {
  communities: true,
  blog: false,
  pages: false,
};
