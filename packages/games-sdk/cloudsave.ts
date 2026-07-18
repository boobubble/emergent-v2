import type { SDKResult } from "./types";

export interface CloudSaveSlot<T = unknown> {
  slot: string;
  data: T;
  updatedAt?: string;
  version?: number;
}

export interface CloudSaveAdapter {
  saveGame<T = unknown>(slot: string, data: T): Promise<SDKResult<CloudSaveSlot<T>>>;
  loadGame<T = unknown>(slot: string): Promise<SDKResult<CloudSaveSlot<T> | null>>;
  deleteSave(slot: string): Promise<SDKResult<void>>;
  listSaves(): Promise<SDKResult<CloudSaveSlot[]>>;
}
