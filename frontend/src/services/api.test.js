import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./api";

describe("getErrorMessage", () => {
  it("returns timeout message for ECONNABORTED", () => {
    const message = getErrorMessage({ code: "ECONNABORTED" });
    expect(message).toContain("demasiado");
  });

  it("returns auth message for 401", () => {
    const message = getErrorMessage({ response: { status: 401 } });
    expect(message).toContain("API key");
  });

  it("uses backend detail when present", () => {
    const message = getErrorMessage({
      response: { data: { detail: "Error backend" } },
    });
    expect(message).toBe("Error backend");
  });

  it("falls back to provided fallback", () => {
    const message = getErrorMessage({}, "Fallback local");
    expect(message).toBe("Fallback local");
  });
});
