// @ts-check
/* Live fetch adapter. Unused by the mock build; kept for parity. */

import { ApiError } from "./errors.js";

export const liveApi = {
  async request() {
    throw new ApiError("LIVE_API_NOT_CONFIGURED", "The live backend is not configured. Enable mocks for this Phase 0–2 build.", 503);
  }
};
