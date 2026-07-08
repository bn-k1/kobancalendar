// src/__tests__/components/ScheduleEditor.test.js
// Integration-level coverage for the folder-collision safety fix (bug 2):
// canSubmit must go false when a NEW folder (mode="add" / "add-segment")
// collides with one already referenced by another generation, while editing
// a generation's own (already-referenced) folder must keep working.
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ScheduleEditor from "@/components/ScheduleEditor.vue";

// A valid, mutually-consistent CSV trio so trioResult.ok is always true and
// only the epoch/segment metadata validation (the thing under test) can flip
// canSubmit to false.
const validTexts = {
  weekday: "公休,,\n早番,08:00,16:00",
  saturday: "公休,,\n遅番,16:00,00:00",
  holiday: "法休,,\n夜勤,00:00,08:00",
};

function submitDisabled(wrapper) {
  return wrapper.find("button.ed-primary").attributes("disabled") !== undefined;
}

describe("ScheduleEditor canSubmit — folder collision safety", () => {
  it("add: 他世代が参照中のフォルダと衝突すると送信不可になる", () => {
    const wrapper = mount(ScheduleEditor, {
      props: {
        mode: "add",
        initialFrom: "2026-08-01",
        initialFolder: "default",
        initialTexts: validTexts,
        existingFroms: ["2026-05-16"],
        existingFolders: ["default"],
        referencedFolders: ["default"],
      },
    });
    expect(submitDisabled(wrapper)).toBe(true);
  });

  it("add: 未参照の既存フォルダ（orphan）との衝突は警告のみで送信可能", () => {
    const wrapper = mount(ScheduleEditor, {
      props: {
        mode: "add",
        initialFrom: "2026-08-01",
        initialFolder: "orphan",
        initialTexts: validTexts,
        existingFroms: ["2026-05-16"],
        existingFolders: ["orphan"],
        referencedFolders: [],
      },
    });
    expect(submitDisabled(wrapper)).toBe(false);
  });

  it("add-segment: 他世代が参照中のフォルダと衝突すると送信不可になる", () => {
    const wrapper = mount(ScheduleEditor, {
      props: {
        mode: "add-segment",
        initialFrom: "2026-07-16",
        initialFolder: "default",
        initialTexts: validTexts,
        windowStart: "2026-05-16",
        windowEnd: "",
        existingSegmentFroms: ["2026-05-16"],
        existingFolders: ["default"],
        referencedFolders: ["default"],
      },
    });
    expect(submitDisabled(wrapper)).toBe(true);
  });

  it("edit: 自分自身の（参照中の）フォルダとの一致は送信可能なまま", () => {
    // Editing a generation always targets its own already-referenced folder —
    // ScheduleEditor's edit mode skips validateEpochMeta/validateSegmentMeta
    // entirely, so referencedFolders containing that same folder must not
    // block the submit.
    const wrapper = mount(ScheduleEditor, {
      props: {
        mode: "edit",
        initialFrom: "2026-05-16",
        initialFolder: "default",
        initialTexts: validTexts,
        existingFolders: ["default"],
        referencedFolders: ["default"],
      },
    });
    expect(submitDisabled(wrapper)).toBe(false);
  });
});
