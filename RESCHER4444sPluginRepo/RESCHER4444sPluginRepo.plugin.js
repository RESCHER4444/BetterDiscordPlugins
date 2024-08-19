/**
 * @name RESCHER4444sPluginRepo
 * @version 1.1.5
 */

module.exports = (() => {
    const config = {
        info: {
            name: "RESCHER4444sPluginRepo",
            authors: [{ name: "RESCHER4444", github_username: "RESCHER4444" }],
            version: "1.1.5",
            description: "A plugin repository plugin for RESCHER4444's BetterDiscord plugins.",
            github: "https://github.com/RESCHER4444/BetterDiscordPlugins",
            github_raw: "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/"
        },
        main: "index.js"
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() { this._config = config; }
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }
        load() {
            BdApi.showConfirmationModal("Library not found", `The required library is missing. Please click 'Download Now' to download it.`, {
                confirmText: "Download now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, () => BdApi.Plugins.reload());
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Library]) => {
        const { Patcher, Toasts, DiscordModules } = Library;
        const { React } = DiscordModules;
        const fs = require('fs');
        const path = require('path');
        const { Plugins } = BdApi;

        class RESCHER4444sPluginRepo extends Plugin {
            constructor() {
                super();
                this.updateUrl = "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/RESCHER4444sPluginRepo/RESCHER4444sPluginRepo.plugin.js";
            }

            onStart() {
                console.log("Plugin started.");
                this.checkForUpdates();
                this.addToolbarButton();
                this.startObserver();
            }

            onStop() {
                console.log("Plugin stopped.");
                Patcher.unpatchAll();
                this.removeToolbarButton();
                this.stopObserver();
            }

            async checkForUpdates() {
                try {
                    const response = await fetch(this.updateUrl);
                    const newCode = await response.text();
                    const latestVersionMatch = newCode.match(/@version\s+([\d.]+)/);
                    if (latestVersionMatch) {
                        const latestVersion = latestVersionMatch[1];
                        const currentVersion = config.info.version;
                        if (latestVersion !== currentVersion) {
                            console.log(`New version available: ${latestVersion}. Updating...`);
                            this.updatePlugin(newCode);
                        } else {
                            console.log("No new version available.");
                        }
                    }
                } catch (error) {
                    console.error("Error checking for updates:", error);
                }
            }

            updatePlugin(newCode) {
                try {
                    const filePath = path.join(BdApi.Plugins.folder, 'RESCHER4444sPluginRepo.plugin.js');
                    fs.writeFile(filePath, newCode, 'utf8', err => {
                        if (err) {
                            console.error("Failed to update the plugin:", err);
                            Toasts.error("Failed to update the plugin.");
                        } else {
                            Toasts.success("Plugin updated successfully. Please reload to apply changes.");
                        }
                    });
                } catch (error) {
                    console.error("Error updating plugin:", error);
                    Toasts.error("Error updating plugin.");
                }
            }

            addToolbarButton() {
                console.log("Adding toolbar button.");
                const pngIconUrl = 'https://cdn.discordapp.com/attachments/712950521396330498/1271752563183587339/60011896-fotor-20240810101510.png?ex=66b87b5f&is=66b729df&hm=cd66b400d6c72d33d05597d34cdec6f043e10576d5e3db68a360ad98224b34d5&';

                const toolbar = document.querySelector('.toolbar_fc4f04');
                if (!toolbar) {
                    console.error("Toolbar not found.");
                    return;
                }

                if (document.querySelector('.iconWrapper_fc4f04[aria-label="RESCHER4444s Plugins"]')) return;

                const pluginButton = document.createElement('div');
                pluginButton.className = 'iconWrapper_fc4f04 clickable_fc4f04';
                pluginButton.setAttribute('role', 'button');
                pluginButton.setAttribute('aria-label', 'RESCHER4444s Plugins');

                const img = document.createElement('img');
                img.src = pngIconUrl;
                img.style.width = '24px';
                img.style.height = '24px';
                img.style.objectFit = 'contain';

                pluginButton.appendChild(img);

                pluginButton.style.width = '24px';
                pluginButton.style.height = '24px';
                pluginButton.style.display = 'flex';
                pluginButton.style.alignItems = 'center';
                pluginButton.style.justifyContent = 'center';

                pluginButton.addEventListener('click', () => {
                    this.openPluginPanel();
                });

                toolbar.appendChild(pluginButton);
            }

            removeToolbarButton() {
                console.log("Removing toolbar button.");
                const pluginButton = document.querySelector('.iconWrapper_fc4f04[aria-label="RESCHER4444s Plugins"]');
                if (pluginButton) pluginButton.remove();
            }

            openPluginPanel() {
                console.log("Opening plugin panel.");
                const existingPanel = document.querySelector('#rescher-plugin-panel');
                if (existingPanel) {
                    existingPanel.style.display = 'flex';
                    return;
                }

                const panelDiv = document.createElement('div');
                panelDiv.id = 'rescher-plugin-panel';
                panelDiv.style.position = 'fixed';
                panelDiv.style.top = '0';
                panelDiv.style.right = '0';
                panelDiv.style.width = '400px';  
                panelDiv.style.height = '100%';
                panelDiv.style.backgroundColor = '#2f3136';
                panelDiv.style.zIndex = '9999';
                panelDiv.style.display = 'flex';
                panelDiv.style.flexDirection = 'column';
                panelDiv.style.overflowY = 'auto';
                panelDiv.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';

                const header = document.createElement('div');
                header.style.backgroundColor = '#7289da';
                header.style.color = '#ffffff';
                header.style.padding = '15px';
                header.style.fontSize = '18px';
                header.style.fontWeight = 'bold';
                header.style.textAlign = 'center';
                header.innerText = "RESCHER4444's Plugins";
                panelDiv.appendChild(header);

                const pluginListDiv = document.createElement('div');
                pluginListDiv.id = 'plugin-list';
                pluginListDiv.style.padding = '15px';
                pluginListDiv.style.flex = '1 1 0%';
                pluginListDiv.style.overflowY = 'auto';
                panelDiv.appendChild(pluginListDiv);

                const closeButton = document.createElement('button');
                closeButton.innerText = 'Close';
                closeButton.style.margin = '10px';
                closeButton.style.padding = '10px 20px';
                closeButton.style.border = 'none';
                closeButton.style.borderRadius = '5px';
                closeButton.style.backgroundColor = '#43b581';
                closeButton.style.color = '#ffffff';
                closeButton.style.cursor = 'pointer';
                closeButton.onclick = () => {
                    panelDiv.style.display = 'none';
                };
                panelDiv.appendChild(closeButton);

                document.body.appendChild(panelDiv);

                this.updatePluginList();
            }

            async updatePluginList() {
                console.log("Updating plugin list...");

                const plugins = [
                    { name: 'AutoCamera', downloadUrl: 'https://github.com/RESCHER4444/BetterDiscordPlugins/raw/main/AutoCamera/AutoCamera.plugin.js' },
                    { name: 'AutoJoinVoice', downloadUrl: 'https://github.com/RESCHER4444/BetterDiscordPlugins/raw/main/AutoJoinVoice/AutoJoinVoice.plugin.js' },
                    { name: 'QuestCracker', downloadUrl: 'https://github.com/RESCHER4444/BetterDiscordPlugins/raw/main/QuestCracker/QuestCracker.plugin.js' }
                ];

                console.log("Plugins to be displayed:", plugins);

                const pluginListDiv = document.querySelector('#plugin-list');
                if (!pluginListDiv) {
                    console.error("Plugin list div not found.");
                    return;
                }

                pluginListDiv.innerHTML = plugins.length
                    ? plugins.map(({ name, downloadUrl }) => `
                        <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ffffff; border-radius: 5px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #ffffff; font-weight: bold;">${name}</span>
                                <a href="${downloadUrl}" style="background-color: #43b581; color: #ffffff; padding: 5px 10px; border-radius: 3px; text-decoration: none;">Download</a>
                            </div>
                        </div>
                    `).join('')
                    : '<p style="color: #ffffff;">No plugins found.</p>';
            }

            startObserver() {
                console.log("Observer started.");
            }

            stopObserver() {
                console.log("Observer stopped.");
            }
        }

        return RESCHER4444sPluginRepo;
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
