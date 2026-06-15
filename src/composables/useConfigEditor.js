// Config-editing helper shared by the admin sections that mutate config.json
// (schedule generations and custom holidays).
//
// Each section keeps its own view of config for display, but commits MUST be
// based on the freshest config.json — otherwise a section holding a stale copy
// would clobber a change another section just committed (e.g. adding a schedule
// wipes a holiday that was added moments earlier). commitConfig() re-reads
// config.json immediately before writing to make read-modify-write safe.

import { useGitHubApi } from "@/composables/useGitHubApi";

const CONFIG_PATH = "config/config.json";

export function useConfigEditor() {
  const { getFile, commitFiles } = useGitHubApi();

  async function readConfig() {
    const file = await getFile(CONFIG_PATH);
    return file ? JSON.parse(file.content) : { schedules: [] };
  }

  // Re-read config, let `build(freshCfg)` produce the next state, and commit it
  // atomically. build returns { config, message, extraFiles? } and may be async
  // (e.g. to list a folder's files for deletion). Returns the new commit sha.
  async function commitConfig({ build, branch } = {}) {
    const current = await readConfig();
    const {
      config,
      message,
      extraFiles = [],
    } = await build(JSON.parse(JSON.stringify(current)));
    const files = [
      { path: CONFIG_PATH, content: JSON.stringify(config, null, 2) + "\n" },
      ...extraFiles,
    ];
    return commitFiles({ message, files, branch });
  }

  return { readConfig, commitConfig };
}
