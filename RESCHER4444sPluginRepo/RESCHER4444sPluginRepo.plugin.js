/**
 * @name RESCHER4444sPluginRepo
 * @author RESCHER4444
 * @description A plugin repository plugin for RESCHER4444's BetterDiscord plugins.
 * @version 1.1.1
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/RESCHER4444sPluginRepo/RESCHER4444sPluginRepo.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/RESCHER4444sPluginRepo/RESCHER4444sPluginRepo.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */

module.exports = (() => {
    const config = {
        info: {
            name: "RESCHER4444sPluginRepo",
            authors: [{ name: "RESCHER4444", github_username: "RESCHER4444" }],
            version: "1.1.1",
            description: "A plugin repository plugin for RESCHER4444's BetterDiscord plugins.",
            github: "https://github.com/RESCHER4444/BetterDiscordPlugins",
            github_raw: "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/"
        },
        changelog: [
            { title: "First publication", type: "added", items: ["Creates the plugin repository."] },
            { title: "UI Update", type: "added", items: ["Added a modern UI to view and manage plugins."] },
            { title: "Download Functionality", type: "added", items: ["Added functionality to download and save plugins directly."] },
            { title: "Toolbar Integration", type: "added", items: ["Integrated plugin menu button into the toolbar."] }
        ],
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
        const { WebpackModules, Patcher, Settings, Toasts, DiscordModules, DOMTools } = Library;
        const { React, ReactDOM } = DiscordModules;
        const fs = require('fs');
        const path = require('path');
        const { Plugins } = BdApi;

        class RESCHER4444sPluginRepo extends Plugin {
            constructor() {
                super();
                this.updateUrl = "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/RESCHER4444sPluginRepo/RESCHER4444sPluginRepo.plugin.js";
            }

            onStart() {
                this.checkForUpdates();
                this.addToolbarButton();
                this.startObserver();
            }

            onStop() {
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
                const pngIconUrl = 'https://cdn.discordapp.com/attachments/712950521396330498/1271752563183587339/60011896-fotor-20240810101510.png?ex=66b87b5f&is=66b729df&hm=cd66b400d6c72d33d05597d34cdec6f043e10576d5e3db68a360ad98224b34d5&';

                const toolbar = document.querySelector('.toolbar_fc4f04');
                if (!toolbar) return;

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
                const pluginButton = document.querySelector('.iconWrapper_fc4f04[aria-label="RESCHER4444s Plugins"]');
                if (pluginButton) pluginButton.remove();
            }

            openPluginPanel() {
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

                const listDiv = document.createElement('div');
                listDiv.id = 'plugin-list';
                listDiv.style.padding = '15px';
                listDiv.style.flex = '1';
                listDiv.style.overflowY = 'auto';
                panelDiv.appendChild(listDiv);

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

                this.loadPluginList().then(plugins => {
                    const listElement = document.getElementById('plugin-list');
                    listElement.innerHTML = plugins.length > 0 
                        ? plugins.map(({ name, downloadUrl }) => `
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 16px; color: #ffffff;">${name}</span>
                                    <button 
                                        style="padding: 5px 10px; border: none; border-radius: 5px; background-color: #7289da; color: #ffffff; cursor: pointer;"
                                        onclick="window.downloadPlugin('${downloadUrl}')"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        `).join('')
                        : '<p style="color: #ffffff;">No plugins found.</p>';
                });
            }

            async loadPluginList() {
                const pluginListUrl = `${config.info.github_raw}BetterDiscordPlugins/`;
                const response = await fetch(pluginListUrl);
                const text = await response.text();
                const regex = /\/BetterDiscordPlugins\/([^\/]+)\/\1\.plugin\.js/g;
                const matches = [...text.matchAll(regex)];
                return matches.map(match => ({
                    name: match[1],
                    downloadUrl: `${config.info.github_raw}BetterDiscordPlugins/${match[1]}/${match[1]}.plugin.js`
                }));
            }

            downloadPlugin = async (url) => {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const fileName = url.split('/').pop();
                    const filePath = path.join(Plugins.folder, fileName);
                    
                    fs.writeFile(filePath, Buffer.from(await blob.arrayBuffer()), err => {
                        if (err) {
                            console.error("Failed to save the plugin:", err);
                            Toasts.error("Failed to save the plugin.");
                        } else {
                            Toasts.success("Plugin successfully saved!");
                        }
                    });
                } catch (e) {
                    console.error("Error downloading the plugin:", e);
                    Toasts.error("Error downloading the plugin.");
                }
            };

            startObserver() {
                this.observer = new MutationObserver(() => {
                    this.addToolbarButton();
                });

                this.observer.observe(document.body, { childList: true, subtree: true });
            }

            stopObserver() {
                if (this.observer) {
                    this.observer.disconnect();
                }
            }
        }

        return RESCHER4444sPluginRepo;
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
