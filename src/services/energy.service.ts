import { notImplemented } from "./_shared";

export interface EnergyState { current: number; max: number; regenPerMin: number; nextTickAt: string }
export interface EnergyService {
  get(userId: string): Promise<EnergyState>;
  spend(userId: string, amount: number, reason: string): Promise<EnergyState>;
  grant(userId: string, amount: number, reason: string): Promise<EnergyState>;
}

export const energyService: EnergyService = {
  get: () => notImplemented("energy", "get"),
  spend: () => notImplemented("energy", "spend"),
  grant: () => notImplemented("energy", "grant"),
};
