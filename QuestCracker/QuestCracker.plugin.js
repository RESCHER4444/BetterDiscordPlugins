/**
 * @name QuestCracker
 * @author RESCHER4444
 * @description First accept a quest, and then activate the plugin for 2 seconds. The quest will now slowly fill up.
 * @version 1.3
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/blob/main/QuestCracker/QuestCracker.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/QuestCracker/QuestCracker.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */

module.exports = class QuestCracker {
    constructor() {
        this._config = {
            info: {
                name: "QuestCracker",
                authors: [
                    {
                        name: "RESCHER4444",
                        discord_id: "616297463409672193",
                    }
                ],
                version: "1.3",
                description: "First accept a quest, and then activate the plugin for 2 seconds. The quest will now slowly fill up.",
            },
            main: "index.js",
        };

        this.updateUrl = "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/QuestCracker/QuestCracker.plugin.js";
    }

    start() {
        console.log("QuestCracker Plugin gestartet.");
        this.checkForUpdates();
        this.runScript();
    }

    stop() {
        console.log("QuestCracker Plugin gestoppt.");
    }

    checkForUpdates() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", this.updateUrl, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const latestCode = xhr.responseText;
                const latestVersionMatch = latestCode.match(/@version\s+([\d.]+)/);
                if (latestVersionMatch) {
                    const latestVersion = latestVersionMatch[1];
                    const currentVersion = this._config.info.version;
                    if (latestVersion !== currentVersion) {
                        console.log(`New version found: ${latestVersion}. Updating...`);
                        this.updatePlugin(latestCode);
                    } else {
                        console.log("No new version available.");
                    }
                }
            } else if (xhr.readyState === 4) {
                console.error("Error checking for updates:", xhr.statusText);
            }
        };
        xhr.send();
    }

    updatePlugin(newCode) {
        try {
            const fs = require('fs');
            const path = require('path');
            const pluginPath = path.join(__dirname, 'QuestCracker.plugin.js');
            fs.writeFileSync(pluginPath, newCode, 'utf8');
            console.log("Plugin successfully updated. Please restart Discord to apply the changes.");
        } catch (error) {
            console.error("Error updating plugin:", error);
        }
    }

    runScript() {
        delete window.$;
        let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
        webpackChunkdiscord_app.pop();

        let ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata).exports.Z;
        let RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getRunningGames).exports.ZP;
        let QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getQuest).exports.Z;
        let ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getAllThreadsForParent).exports.Z;
        let GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getSFWDefaultChannel).exports.ZP;
        let FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.flushWaitQueue).exports.Z;
        let api = Object.values(wpRequire.c).find(x => x?.exports?.tn?.get).exports.tn;

        let quest = [...QuestsStore.quests.values()].find(x => x.id !== "1248385850622869556" && x.userStatus?.enrolledAt && !x.userStatus?.completedAt && new Date(x.config.expiresAt).getTime() > Date.now())
        let isApp = typeof DiscordNative !== "undefined"
        if(!quest) {
            console.log("You don't have any uncompleted quests!")
        } else {
            const pid = Math.floor(Math.random() * 30000) + 1000

            const applicationId = quest.config.application.id
            const applicationName = quest.config.application.name
            const questName = quest.config.messages.questName
            const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2
            const taskName = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"].find(x => taskConfig.tasks[x] != null)
            const secondsNeeded = taskConfig.tasks[taskName].target
            let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0

            if(taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
                const maxFuture = 10, speed = 7, interval = 1
                const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime()
                let completed = false
                let fn = async () => {			
                    while(true) {
                        const maxAllowed = Math.floor((Date.now() - enrolledAt)/1000) + maxFuture
                        const diff = maxAllowed - secondsDone
                        const timestamp = secondsDone + speed
                        if(diff >= speed) {
                            const res = await api.post({url: `/quests/${quest.id}/video-progress`, body: {timestamp: Math.min(secondsNeeded, timestamp + Math.random())}})
                            completed = res.body.completed_at != null
                            secondsDone = Math.min(secondsNeeded, timestamp)
                        }

                        if(timestamp >= secondsNeeded) {
                            break
                        }
                        await new Promise(resolve => setTimeout(resolve, interval * 1000))
                    }
                    if(!completed) {
                        await api.post({url: `/quests/${quest.id}/video-progress`, body: {timestamp: secondsNeeded}})
                    }
                    console.log("Quest completed!")
                }
                fn()
                console.log(`Spoofing video for ${questName}.`)
            } else if(taskName === "PLAY_ON_DESKTOP") {
                if(!isApp) {
                    console.log("This no longer works in browser for non-video quests. Use the discord desktop app to complete the", questName, "quest!")
                } else {
                    api.get({url: `/applications/public?application_ids=${applicationId}`}).then(res => {
                        const appData = res.body[0]
                        const exeName = appData.executables.find(x => x.os === "win32").name.replace(">","")

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
                        }
                        const realGames = RunningGameStore.getRunningGames()
                        const fakeGames = [fakeGame]
                        const realGetRunningGames = RunningGameStore.getRunningGames
                        const realGetGameForPID = RunningGameStore.getGameForPID
                        RunningGameStore.getRunningGames = () => fakeGames
                        RunningGameStore.getGameForPID = (pid) => fakeGames.find(x => x.pid === pid)
                        FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames})

                        let fn = data => {
                            let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value)
                            console.log(`Quest progress: ${progress}/${secondsNeeded}`)

                            if(progress >= secondsNeeded) {
                                console.log("Quest completed!")

                                RunningGameStore.getRunningGames = realGetRunningGames
                                RunningGameStore.getGameForPID = realGetGameForPID
                                FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: []})
                                FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn)
                            }
                        }
                        FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn)

                        console.log(`Spoofed your game to ${applicationName}. Wait for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`)
                    })
                }
            } else if(taskName === "STREAM_ON_DESKTOP") {
                if(!isApp) {
                    console.log("This no longer works in browser for non-video quests. Use the discord desktop app to complete the", questName, "quest!")
                } else {
                    let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata
                    ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
                        id: applicationId,
                        pid,
                        sourceName: null
                    })

                    let fn = data => {
                        let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value)
                        console.log(`Quest progress: ${progress}/${secondsNeeded}`)

                        if(progress >= secondsNeeded) {
                            console.log("Quest completed!")

                            ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc
                            FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn)
                        }
                    }
                    FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn)

                    console.log(`Spoofed your stream to ${applicationName}. Stream any window in vc for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`)
                    console.log("Remember that you need at least 1 other person to be in the vc!")
                }
            } else if(taskName === "PLAY_ACTIVITY") {
                const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id
                const streamKey = `call:${channelId}:1`

                let fn = async () => {
                    console.log("Completing quest", questName, "-", quest.config.messages.questName)

                    while(true) {
                        const res = await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: false}})
                        const progress = res.body.progress.PLAY_ACTIVITY.value
                        console.log(`Quest progress: ${progress}/${secondsNeeded}`)

                        await new Promise(resolve => setTimeout(resolve, 20 * 1000))

                        if(progress >= secondsNeeded) {
                            await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: true}})
                            break
                        }
                    }

                    console.log("Quest completed!")
                }
                fn()
            }
        }
    }
};
