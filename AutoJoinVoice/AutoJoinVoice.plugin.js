/**
 * @name AutoJoinVoice
 * @author RESCHER4444
 * @description Constantly joins a voice channel via ID.
 * @version 1.1.0
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/blob/main/AutoJoinVoice/AutoJoinVoice.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/AutoJoinVoice/AutoJoinVoice.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */
module.exports = class AutoJoinVoice {
    constructor() {
        this.interval = null;
        this.channelId = null;
        this.missingCount = 0;
        this.maxMissingCount = 2;
        this.updateUrl = "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/AutoJoinVoice/AutoJoinVoice.plugin.js";
    }

    start() {
        console.log("AutoJoinVoice Plugin gestartet.");
        this.checkForUpdates();

        if (!this.channelId) {
            console.error("Keine Kanal-ID gesetzt. Das Plugin wird nicht gestartet.");
            return;
        }

        this.interval = setInterval(() => {
            this.joinVoiceChannel(this.channelId);
        }, 1500); 
    }

    stop() {
        console.log("AutoJoinVoice Plugin gestoppt.");

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.missingCount = 0;
    }

    setChannelId(channelId) {
        if (typeof channelId === 'string' && channelId.trim() !== '') {
            this.channelId = channelId;
            this.start(); 
        } else {
            console.error("Ungültige Kanal-ID. Bitte gib eine gültige Kanal-ID ein.");
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

    handleMissingChannel() {
        this.missingCount += 1;
        if (this.missingCount >= this.maxMissingCount) {
            this.stop();
            console.warn("Der Kanal wurde zweimal hintereinander nicht gefunden. Das Plugin wird gestoppt.");
        }
    }

    getSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'auto-join-voice-settings';
        panel.innerHTML = `
            <div style="padding: 10px;">
                <h3>AutoJoinVoice Einstellungen</h3>
                <input id="channel-id-input" type="text" placeholder="Geben Sie die Kanal-ID ein" style="width: 100%; padding: 5px; margin-bottom: 10px;">
                <button id="set-channel-id" style="width: 100%; padding: 5px;">Kanal-ID setzen</button>
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
                    const currentVersion = this.constructor._config.info.version;
                    if (latestVersion !== currentVersion) {
                        console.log(`Neue Version gefunden: ${latestVersion}. Aktualisieren...`);
                        this.updatePlugin(latestCode);
                    } else {
                        console.log("Keine neue Version verfügbar.");
                    }
                }
            } else if (xhr.readyState === 4) {
                console.error("Fehler beim Überprüfen auf Updates:", xhr.statusText);
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
            console.log("Plugin erfolgreich aktualisiert. Bitte starten Sie Discord neu, um die Änderungen zu übernehmen.");
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Plugins:", error);
        }
    }
};
