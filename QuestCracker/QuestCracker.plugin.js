/**
 * @name QuestCracker
 * @author RESCHER4444
 * @description Accept a quest and then activate the plugin.
 * @version 3.1
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/blob/main/QuestCracker/QuestCracker.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/QuestCracker/QuestCracker.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */

module.exports = class QuestCracker {

    constructor() {
        this.running = false;
        this.currentProgress = "0";
    }

    log(...msg) {
        console.log("[QuestCracker]", ...msg);
    }

    toast(msg) {
        this.log(msg);
    }

    getStores() {

        let wpRequire =
            webpackChunkdiscord_app.push([
                [Symbol()],
                {},
                r => r
            ]);

        webpackChunkdiscord_app.pop();

        const find = (filter) =>
            Object.values(wpRequire.c)
                .find(x => filter(x?.exports))
                ?.exports;

        const QuestsStore =
            find(x =>
                x?.Z?.__proto__?.getQuest)?.Z ??
            find(x =>
                x?.A?.__proto__?.getQuest)?.A;

        const ChannelStore =
            find(x =>
                x?.Z?.__proto__?.getSortedPrivateChannels)?.Z ??
            find(x =>
                x?.A?.__proto__?.getSortedPrivateChannels)?.A;

        const api =
            find(x => x?.tn?.get)?.tn ??
            find(x => x?.Bo?.get)?.Bo;

        return {
            QuestsStore,
            ChannelStore,
            api
        };
    }

    async completeQuest(quest, Stores) {

        const taskConfig =
            quest.config.taskConfig ??
            quest.config.taskConfigV2;

        const taskName =
            Object.keys(taskConfig.tasks)[0];

        const secondsNeeded =
            taskConfig.tasks[taskName].target;

        this.toast(
            "Completing " +
            quest.config.application.name +
            " (" + taskName + ")"
        );

        while (this.running) {

            let body = {};

            if (taskName === "PLAY_ACTIVITY") {

                body = {

                    activity_key:
                        "application:" +
                        quest.config.application.id,

                    terminal: false
                };
            }
            else {

                const channelId =
                    Stores.ChannelStore
                        .getSortedPrivateChannels()[0]?.id;

                if (!channelId) {
                    this.toast("No private channel found");
                    return;
                }

                body = {

                    stream_key:
                        "call:" +
                        channelId +
                        ":1",

                    terminal: false
                };
            }

            const res =
                await Stores.api.post({

                    url:
                        "/quests/" +
                        quest.id +
                        "/heartbeat",

                    body
                });

            const progress =
                Object.values(
                    res.body.progress
                )[0]?.value ?? 0;

            this.currentProgress =
                progress +
                "/" +
                secondsNeeded;

            this.log(
                "Progress:",
                this.currentProgress
            );

            if (progress >= secondsNeeded)
                break;

            await new Promise(r =>
                setTimeout(r, 20000));
        }

        await Stores.api.post({

            url:
                "/quests/" +
                quest.id +
                "/heartbeat",

            body: {terminal: true}
        });

        this.toast("Quest completed");
    }

    async start() {

        this.running = true;

        try {

            const Stores =
                this.getStores();

            if (!Stores.QuestsStore) {

                this.toast(
                    "QuestsStore not found"
                );

                return;
            }

            const quests =
                [...Stores.QuestsStore.quests.values()]
                    .filter(q =>
                        q.userStatus?.enrolledAt &&
                        !q.userStatus?.completedAt
                    );

            if (!quests.length) {

                this.toast(
                    "No active quests"
                );

                return;
            }

            this.toast(
                quests.length +
                " active quest(s) found"
            );

            for (const quest of quests) {

                if (!this.running)
                    break;

                await this.completeQuest(
                    quest,
                    Stores
                );
            }

            this.toast(
                "All quests completed"
            );
        }
        catch (e) {

            console.error(e);

            this.toast(
                "Error: " +
                e.message
            );
        }
    }

    stop() {

        this.running = false;

        this.toast("Stopped");
    }
};
