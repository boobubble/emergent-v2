/**
 * Service stubs for upcoming modules.
 *
 * Each export is a typed interface + a `notImplemented` placeholder
 * so future implementations can swap in a concrete service without
 * touching call sites. None of these perform any I/O yet.
 *
 * Usage pattern (future):
 *   import { coinGiftingService } from "@/services";
 *   await coinGiftingService.send({ to, amount });
 *
 * To implement a module, replace the matching `*.service.ts` file
 * with a real implementation that satisfies the same interface.
 */

export { coinGiftingService, type CoinGiftingService } from "./coin-gifting.service";
export { coinBombsService, type CoinBombsService } from "./coin-bombs.service";
export { creatorTippingService, type CreatorTippingService } from "./creator-tipping.service";
export { momentumService, type MomentumService } from "./momentum.service";
export { energyService, type EnergyService } from "./energy.service";
export { marketplaceService, type MarketplaceService } from "./marketplace.service";
export { cosmeticsShopService, type CosmeticsShopService } from "./cosmetics-shop.service";
export { avatarFramesService, type AvatarFramesService } from "./avatar-frames.service";
export { usernameEffectsService, type UsernameEffectsService } from "./username-effects.service";
export { clansService, type ClansService } from "./clans.service";
export { voiceRoomsService, type VoiceRoomsService } from "./voice-rooms.service";
export { storiesService, type StoriesService } from "./stories.service";
export { tournamentsService, type TournamentsService } from "./tournaments.service";
export { seasonalEventsService, type SeasonalEventsService } from "./seasonal-events.service";
export { premiumService, type PremiumService } from "./premium.service";
export { roomBoostsService, type RoomBoostsService } from "./room-boosts.service";
export { creatorSupportService, type CreatorSupportService } from "./creator-support.service";
export { aiFeaturesService, type AiFeaturesService } from "./ai-features.service";

export { notImplemented } from "./_shared";
