/**
 * @name DiscordQuests
 * @author exanime.
 * @authorLink https://github.com/Exanime02
 * @description Complete missions with just a shortcut. Default: Ctrl+Q. Compatible with Discord Stable and Canary.
 * @version 3.0.0
 * @updateUrl https://raw.githubusercontent.com/Exanime02/BetterDiscord/main/DiscordQuests.plugin.js
 * @donate https://paypal.me/ExanimeTV
 * @source https://github.com/Exanime02/BetterDiscord
 * @website https://exanime.site/
 */

module.exports = class DiscordQuests {
  constructor() {
    this.defaultSettings = {
      shortcutKey: "q",
      modifier: "ctrl"
    };

    this.settings = BdApi.Data.load("DiscordQuests", "settings") || { ...this.defaultSettings };
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.PLUGIN_NAME = "DiscordQuests";
    this.UPDATE_URL = "https://raw.githubusercontent.com/Exanime02/BetterDiscord/main/DiscordQuests.plugin.js";
    this.CURRENT_VERSION = "2.2.3";
  }

  start() {
    document.addEventListener("keydown", this.handleKeyDown);
    console.log("[DiscordQuests] Plugin started");
  }

  stop() {
    document.removeEventListener("keydown", this.handleKeyDown);
    console.log("[DiscordQuests] Plugin stopped");
  }

  handleKeyDown(event) {
    let ctrlMatch, shiftMatch, altMatch;
    
    switch(this.settings.modifier) {
      case "ctrl":
        ctrlMatch = event.ctrlKey || event.metaKey;
        shiftMatch = !event.shiftKey;
        altMatch = !event.altKey;
        break;
      case "shift":
        ctrlMatch = !event.ctrlKey && !event.metaKey;
        shiftMatch = event.shiftKey;
        altMatch = !event.altKey;
        break;
      case "alt":
        ctrlMatch = !event.ctrlKey && !event.metaKey;
        shiftMatch = !event.shiftKey;
        altMatch = event.altKey;
        break;
      case "ctrl+shift":
        ctrlMatch = event.ctrlKey || event.metaKey;
        shiftMatch = event.shiftKey;
        altMatch = !event.altKey;
        break;
      case "ctrl+alt":
        ctrlMatch = event.ctrlKey || event.metaKey;
        shiftMatch = !event.shiftKey;
        altMatch = event.altKey;
        break;
      case "shift+alt":
        ctrlMatch = !event.ctrlKey && !event.metaKey;
        shiftMatch = event.shiftKey;
        altMatch = event.altKey;
        break;
      case "ctrl+shift+alt":
        ctrlMatch = event.ctrlKey || event.metaKey;
        shiftMatch = event.shiftKey;
        altMatch = event.altKey;
        break;
      default:
        ctrlMatch = event.ctrlKey || event.metaKey;
        shiftMatch = !event.shiftKey;
        altMatch = !event.altKey;
    }
    
    const keyMatch = event.key.toLowerCase() === this.settings.shortcutKey.toLowerCase();

    if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
      event.preventDefault();
      this.runSnippet();
    }
  }

  async checkForUpdates(showUpToDateToast = true) {
    const toast = (message, type = "info") => {
      if (BdApi?.UI?.showToast) BdApi.UI.showToast(message, { type });
      console.log(`[DiscordQuests] ${message}`);
    };

    const parseVersionFromSource = (src) => {
      const match = src.match(/@version\s+([0-9]+(?:\.[0-9]+){0,3})/i);
      return match ? match[1].trim() : null;
    };

    const compareVersions = (a, b) => {

      const pa = String(a).split(".").map(n => parseInt(n, 10) || 0);
      const pb = String(b).split(".").map(n => parseInt(n, 10) || 0);
      const len = Math.max(pa.length, pb.length);
      for (let i = 0; i < len; i++) {
        const da = pa[i] ?? 0;
        const db = pb[i] ?? 0;
        if (da > db) return 1;
        if (da < db) return -1;
      }
      return 0;
    };

    try {
      toast("Checking for updates...", "info");

      const res = await fetch(this.UPDATE_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

      const remoteSource = await res.text();
      const remoteVersion = parseVersionFromSource(remoteSource);

      if (!remoteVersion) {
        toast("Update check failed: could not read remote version.", "error");
        return;
      }

      const cmp = compareVersions(remoteVersion, this.CURRENT_VERSION);

      if (cmp <= 0) {
        if (showUpToDateToast) toast(`You're up to date (v${this.CURRENT_VERSION}).`, "success");
        return;
      }

      toast(`New version found: v${remoteVersion}. Downloading...`, "info");


      const fs = require("fs");
      const path = require("path");

      const pluginsFolder = BdApi.Plugins.folder;
      const filePath = path.join(pluginsFolder, `${this.PLUGIN_NAME}.plugin.js`);

      fs.writeFileSync(filePath, remoteSource, "utf8");

      toast(`Updated to v${remoteVersion}. Please reload Discord (Ctrl+R) or restart.`, "success");
    } catch (err) {
      console.error("[DiscordQuests] Update check error:", err);
      if (BdApi?.UI?.showToast) BdApi.UI.showToast(`Update check failed: ${String(err.message || err)}`, { type: "error" });
    }
  }

  runSnippet() {
    try {
      console.log("[DiscordQuests] Shortcut triggered - Executing...");



      delete window.$;


      let webpackChunk;
      if (typeof webpackChunkdiscord_app !== "undefined") {
        webpackChunk = webpackChunkdiscord_app;
      } else if (typeof webpackChunkdiscord_canary !== "undefined") {
        webpackChunk = webpackChunkdiscord_canary;
      } else if (typeof webpackChunkdiscord_ptb !== "undefined") {
        webpackChunk = webpackChunkdiscord_ptb;
      } else {
        console.error("[DiscordQuests] Could not find Discord webpack chunk!");
        return;
      }

      let wpRequire = webpackChunk.push([[Symbol()], {}, r => r]);
      webpackChunk.pop();

      let ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata)?.exports?.Z;
      let RunningGameStore, QuestsStore, ChannelStore, GuildChannelStore, FluxDispatcher, api;

      if (!ApplicationStreamingStore) {
        ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getStreamerActiveStreamMetadata).exports.A;
        RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.Ay?.getRunningGames).exports.Ay;
        QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getQuest).exports.A;
        ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.A?.__proto__?.getAllThreadsForParent).exports.A;
        GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Ay?.getSFWDefaultChannel).exports.Ay;
        FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.h?.__proto__?.flushWaitQueue).exports.h;
        api = Object.values(wpRequire.c).find(x => x?.exports?.Bo?.get).exports.Bo;
      } else {
        RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getRunningGames).exports.ZP;
        QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getQuest).exports.Z;
        ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getAllThreadsForParent).exports.Z;
        GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getSFWDefaultChannel).exports.ZP;
        FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.flushWaitQueue).exports.Z;
        api = Object.values(wpRequire.c).find(x => x?.exports?.tn?.get).exports.tn;
      }

      const supportedTasks = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"];
      let quests = [...QuestsStore.quests.values()].filter(x =>
        x.userStatus?.enrolledAt &&
        !x.userStatus?.completedAt &&
        new Date(x.config.expiresAt).getTime() > Date.now() &&
        supportedTasks.find(y => Object.keys((x.config.taskConfig ?? x.config.taskConfigV2).tasks).includes(y))
      );
      let isApp = typeof DiscordNative !== "undefined";

      if (quests.length === 0) {
        console.log("[DiscordQuests] You don't have any incomplete quests!");
      } else {
        let doJob = function () {
          const quest = quests.pop();
          if (!quest) return;

          const pid = Math.floor(Math.random() * 30000) + 1000;
          const applicationId = quest.config.application.id;
          const applicationName = quest.config.application.name;
          const questName = quest.config.messages.questName;
          const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
          const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);
          const secondsNeeded = taskConfig.tasks[taskName].target;
          let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

          if (taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
            const maxFuture = 10, speed = 7, interval = 1;
            const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
            let completed = false;
            let fn = async () => {
              try {
                while (true) {
                  const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + maxFuture;
                  const diff = maxAllowed - secondsDone;
                  const timestamp = secondsDone + speed;
                  if (diff >= speed) {
                    const res = await api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: Math.min(secondsNeeded, timestamp + Math.random()) } });
                    completed = res.body.completed_at != null;
                    secondsDone = Math.min(secondsNeeded, timestamp);
                  }

                  if (timestamp >= secondsNeeded) {
                    break;
                  }
                  await new Promise(resolve => setTimeout(resolve, interval * 1000));
                }
                if (!completed) {
                  await api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: secondsNeeded } });
                }
                console.log("[DiscordQuests] Quest completed!");
                doJob();
              } catch (error) {
                console.error(`[DiscordQuests] Error in ${questName}:`, error);
              }
            };
            fn();
            console.log(`[DiscordQuests] Simulating video for ${questName}.`);
          } else if (taskName === "PLAY_ON_DESKTOP") {
            if (!isApp) {
              console.log(`[DiscordQuests] This no longer works in the browser for non-video quests. Use the Discord desktop app to complete the quest ${questName}!`);
            } else {
              api.get({ url: `/applications/public?application_ids=${applicationId}` }).then(res => {
                const appData = res.body[0];
                const exeName = appData.executables.find(x => x.os === "win32").name.replace(">", "");

                const fakeGame = {
                  cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
                  exeName,
                  exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
                  hidden: false,
                  isLauncher: false,
                  id: applicationId,
                  name: appData.name,
                  pid: pid,
                  pidPath: [pid],
                  processName: appData.name,
                  start: Date.now(),
                };
                const realGames = RunningGameStore.getRunningGames();
                const fakeGames = [fakeGame];
                const realGetRunningGames = RunningGameStore.getRunningGames;
                const realGetGameForPID = RunningGameStore.getGameForPID;
                RunningGameStore.getRunningGames = () => fakeGames;
                RunningGameStore.getGameForPID = (pid) => fakeGames.find(x => x.pid === pid);
                FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });

                let fn = data => {
                  let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
                  console.log(`[DiscordQuests] Quest progress: ${progress}/${secondsNeeded}`);

                  if (progress >= secondsNeeded) {
                    console.log("[DiscordQuests] Quest completed!");

                    RunningGameStore.getRunningGames = realGetRunningGames;
                    RunningGameStore.getGameForPID = realGetGameForPID;
                    FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: [] });
                    FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                    doJob();
                  }
                };
                FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                console.log(`[DiscordQuests] Your game has been simulated as ${applicationName}. Wait ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
              }).catch(error => {
                console.error("[DiscordQuests] Error fetching application data:", error);
              });
            }
          } else if (taskName === "STREAM_ON_DESKTOP") {
            if (!isApp) {
              console.log(`[DiscordQuests] This no longer works in the browser for non-video quests. Use the Discord desktop app to complete the quest ${questName}!`);
            } else {
              let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
              ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
                id: applicationId,
                pid,
                sourceName: null
              });

              let fn = data => {
                let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);
                console.log(`[DiscordQuests] Quest progress: ${progress}/${secondsNeeded}`);

                if (progress >= secondsNeeded) {
                  console.log("[DiscordQuests] Quest completed!");

                  ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
                  FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                  doJob();
                }
              };
              FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

              console.log(`[DiscordQuests] Your stream has been simulated as ${applicationName}. Stream any window in a voice channel for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
              console.log("[DiscordQuests] Remember you need at least 1 other person in the voice channel!");
            }
          } else if (taskName === "PLAY_ACTIVITY") {
            const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
            const streamKey = `call:${channelId}:1`;

            let fn = async () => {
              try {
                console.log(`[DiscordQuests] Completing quest ${questName} - ${quest.config.messages.questName}`);

                while (true) {
                  const res = await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: false } });
                  const progress = res.body.progress.PLAY_ACTIVITY.value;
                  console.log(`[DiscordQuests] Quest progress: ${progress}/${secondsNeeded}`);

                  await new Promise(resolve => setTimeout(resolve, 20 * 1000));

                  if (progress >= secondsNeeded) {
                    await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: true } });
                    break;
                  }
                }

                console.log("[DiscordQuests] Quest completed!");
                doJob();
              } catch (error) {
                console.error(`[DiscordQuests] Error in ${questName}:`, error);
              }
            };
            fn();
          }
        };
        doJob();
      }
    } catch (error) {
      console.error("[DiscordQuests] Critical error:", error);
    }
  }

  getSettingsPanel() {
    const saveSettings = () => {
      BdApi.Data.save("DiscordQuests", "settings", this.settings);
    };

    return BdApi.UI.buildSettingsPanel({
      settings: [
        {
          type: "text",
          id: "shortcutKey",
          name: "Shortcut Key",
          value: this.settings.shortcutKey,
          onChange: (v) => { 
            this.settings.shortcutKey = v; 
            saveSettings();
          }
        },
        {
          type: "dropdown",
          id: "modifier",
          name: "Modifier Keys",
          value: this.settings.modifier,
          options: [
            { label: "Ctrl/Cmd", value: "ctrl" },
            { label: "Shift", value: "shift" },
            { label: "Alt", value: "alt" },
            { label: "Ctrl+Shift", value: "ctrl+shift" },
            { label: "Ctrl+Alt", value: "ctrl+alt" },
            { label: "Shift+Alt", value: "shift+alt" },
            { label: "Ctrl+Shift+Alt", value: "ctrl+shift+alt" }
          ],
          onChange: (v) => { 
            this.settings.modifier = v; 
            saveSettings();
          }
        },
        {
          type: "button",
          id: "checkUpdate",
          name: "Update Plugin",
          onClick: () => {
            this.checkForUpdates(true);
          },
          text: "check",
          className: "button-38a6f0 lookFilled-1GseHa colorBrand-2M3O3N sizeSmall-2_uNNS"
        }
      ]
    });
  }
};
