import { describe, it, expect } from "vitest";
import {
  uploadWorkspaceLogoInput,
  WORKSPACE_LOGO_MAX_BYTES,
  extensionForLogoType,
} from "../workspace.schema";

const WORKSPACE_ID = "11111111-1111-4111-8111-111111111111";
const ACTOR_ID = "22222222-2222-4222-8222-222222222222";

function makeFile(bytes: number, type: string, name = "logo") {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("uploadWorkspaceLogoInput", () => {
  it("accepts a small PNG", () => {
    const result = uploadWorkspaceLogoInput.parse({
      workspaceId: WORKSPACE_ID,
      actorUserId: ACTOR_ID,
      file: makeFile(1024, "image/png", "logo.png"),
    });
    expect(result.file.type).toBe("image/png");
  });

  it("accepts a JPEG", () => {
    expect(() =>
      uploadWorkspaceLogoInput.parse({
        workspaceId: WORKSPACE_ID,
        actorUserId: ACTOR_ID,
        file: makeFile(1024, "image/jpeg", "logo.jpg"),
      })
    ).not.toThrow();
  });

  it("rejects an empty file", () => {
    expect(() =>
      uploadWorkspaceLogoInput.parse({
        workspaceId: WORKSPACE_ID,
        actorUserId: ACTOR_ID,
        file: makeFile(0, "image/png"),
      })
    ).toThrow("A logo file is required");
  });

  it("rejects files larger than the size limit", () => {
    expect(() =>
      uploadWorkspaceLogoInput.parse({
        workspaceId: WORKSPACE_ID,
        actorUserId: ACTOR_ID,
        file: makeFile(WORKSPACE_LOGO_MAX_BYTES + 1, "image/png"),
      })
    ).toThrow("Logo must be 2 MB or smaller");
  });

  it("rejects disallowed formats", () => {
    expect(() =>
      uploadWorkspaceLogoInput.parse({
        workspaceId: WORKSPACE_ID,
        actorUserId: ACTOR_ID,
        file: makeFile(1024, "image/gif", "logo.gif"),
      })
    ).toThrow("Logo must be a PNG or JPEG image");
  });
});

describe("extensionForLogoType", () => {
  it("maps allowed mime types to extensions", () => {
    expect(extensionForLogoType("image/png")).toBe("png");
    expect(extensionForLogoType("image/jpeg")).toBe("jpg");
  });

  it("returns null for unsupported types", () => {
    expect(extensionForLogoType("image/gif")).toBeNull();
  });
});
