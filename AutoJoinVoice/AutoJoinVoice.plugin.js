/**
 * @name AutoJoinVoice
 * @description Constantly joins a voice channel via ID.
 * @version 5.0.6
 */
module.exports = class AutoJoinVoice {
    constructor() {
        this._config = {
            info: {
                name: "AutoJoinVoice",
                authors: [
                    {
                        name: "RESCHER4444",
                        discord_id: "616297463409672193",
                    }
                ],
                version: "5.0.6",
                description: "Constantly joins a voice channel via ID.",
            },
            main: "index.js",
        };

        this.interval = null;
        this.channelId = null;
        this.missingCount = 0;
        this.maxMissingCount = 2;
        this.updateUrl = "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/AutoJoinVoice/AutoJoinVoice.plugin.js";
    }

    start() {
        console.log("AutoJoinVoice Plugin started.");
        this.checkForUpdates();

        if (!this.channelId) {
            console.error("No channel ID set. The plugin will not start.");
            return;
        }

        this.interval = setInterval(() => {
            this.joinVoiceChannel(this.channelId);
        }, 1500);
    }

    stop() {
        console.log("AutoJoinVoice Plugin stopped.");

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.leaveVoiceChannel(); 
        this.missingCount = 0;
    }

    setChannelId(channelId) {
        if (typeof channelId === 'string' && channelId.trim() !== '') {
            this.channelId = channelId;
            this.start();
        } else {
            console.error("Invalid channel ID. Please enter a valid channel ID.");
        }
    }

    joinVoiceChannel(channelId) {
        const voiceChannelModule = BdApi.findModuleByProps("getVoiceChannelId");
        const currentVoiceChannelId = voiceChannelModule ? voiceChannelModule.getVoiceChannelId() : null;

        if (currentVoiceChannelId !== channelId) {
            const selectVoiceChannelModule = BdApi.findModuleByProps("selectVoiceChannel");
            if (selectVoiceChannelModule) {
                selectVoiceChannelModule.selectVoiceChannel(channelId);
                this.missingCount = 0;
            } else {
                this.handleMissingChannel();
            }
        }
    }

    leaveVoiceChannel() {
        const voiceChannelModule = BdApi.findModuleByProps("leaveVoiceChannel");
        if (voiceChannelModule) {
            voiceChannelModule.leaveVoiceChannel();
        }
    }

    handleMissingChannel() {
        this.missingCount += 1;
        if (this.missingCount >= this.maxMissingCount) {
            this.stop();
            console.warn("The channel was not found twice in a row. The plugin will stop.");
        }
    }

    getSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'auto-join-voice-settings';
        panel.innerHTML = `
            <div style="padding: 10px;">
                <h3>AutoJoinVoice Settings</h3>
                <input id="channel-id-input" type="text" placeholder="Enter the channel ID" style="width: 100%; padding: 5px; margin-bottom: 10px;">
                <button id="set-channel-id" style="width: 100%; padding: 5px;">Set Channel ID</button>
            </div>
        `;
        panel.querySelector('#set-channel-id').addEventListener('click', () => {
            const channelId = panel.querySelector('#channel-id-input').value.trim();
            this.setChannelId(channelId);
        });
        return panel;
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
            const pluginPath = path.join(__dirname, 'AutoJoinVoice.plugin.js');
            fs.writeFileSync(pluginPath, newCode, 'utf8');
            console.log("Plugin successfully updated. Please restart Discord to apply the changes.");
        } catch (error) {
            console.error("Error updating plugin:", error);
        }
    }
};
