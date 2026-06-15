// src/__tests__/composables/useConfigEditor.test.js
// Tests for the shared config read-modify-write helper (admin Phase 3).
import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockGetFile, mockCommitFiles } = vi.hoisted(() => ({
  mockGetFile: vi.fn(),
  mockCommitFiles: vi.fn(),
}));

vi.mock("@/composables/useGitHubApi", () => ({
  useGitHubApi: () => ({
    getFile: mockGetFile,
    commitFiles: mockCommitFiles,
  }),
}));

import { useConfigEditor } from "@/composables/useConfigEditor";

beforeEach(() => {
  mockGetFile.mockReset();
  mockCommitFiles.mockReset();
});

describe("readConfig()", () => {
  it("config.json をパースして返す", async () => {
    mockGetFile.mockResolvedValue({
      content: JSON.stringify({ schedules: [{ from: "2026-05-16" }] }),
      sha: "x",
    });
    const { readConfig } = useConfigEditor();
    expect(await readConfig()).toEqual({ schedules: [{ from: "2026-05-16" }] });
  });

  it("ファイルが無ければ空 schedules を返す", async () => {
    mockGetFile.mockResolvedValue(null);
    const { readConfig } = useConfigEditor();
    expect(await readConfig()).toEqual({ schedules: [] });
  });
});

describe("commitConfig()", () => {
  beforeEach(() => {
    mockGetFile.mockResolvedValue({
      content: JSON.stringify({
        schedules: [{ from: "2026-05-16", data: "default" }],
        custom_holidays: ["08-12"],
      }),
      sha: "x",
    });
    mockCommitFiles.mockResolvedValue("sha1");
  });

  it("最新configを読み、buildの結果＋extraFilesを1コミットする", async () => {
    const { commitConfig } = useConfigEditor();
    const sha = await commitConfig({
      build: (cfg) => {
        cfg.custom_holidays = ["08-12", "12-31"];
        return {
          config: cfg,
          message: "config: 独自休日を更新",
          extraFiles: [{ path: "data/x/weekday.csv", content: "公休,,\n" }],
        };
      },
    });

    expect(sha).toBe("sha1");
    const arg = mockCommitFiles.mock.calls[0][0];
    expect(arg.message).toBe("config: 独自休日を更新");
    // config.json first, then extras
    expect(arg.files[0].path).toBe("config/config.json");
    expect(JSON.parse(arg.files[0].content).custom_holidays).toEqual([
      "08-12",
      "12-31",
    ]);
    // schedules preserved from the fresh read
    expect(JSON.parse(arg.files[0].content).schedules).toHaveLength(1);
    expect(arg.files[1]).toEqual({
      path: "data/x/weekday.csv",
      content: "公休,,\n",
    });
  });

  it("コミットのたびに config を読み直す（stale 上書き防止）", async () => {
    const { commitConfig } = useConfigEditor();
    const build = (cfg) => ({ config: cfg, message: "m" });
    await commitConfig({ build });
    await commitConfig({ build });
    expect(mockGetFile).toHaveBeenCalledTimes(2);
  });

  it("build は非同期でもよい", async () => {
    const { commitConfig } = useConfigEditor();
    const sha = await commitConfig({
      build: async (cfg) => {
        await Promise.resolve();
        return { config: cfg, message: "m" };
      },
    });
    expect(sha).toBe("sha1");
  });
});
