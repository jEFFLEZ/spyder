import { logger } from "../utils/logger";
import { findAndKill } from "../utils/detect";
import { QFlashOptions } from "../chain/smartChain";

export async function runKill(_opts?: QFlashOptions) {
  logger.info("qflash: killing modules...");
  const killed = await findAndKill();
  logger.info(`Killed ${killed.length} processes`);
}
