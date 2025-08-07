/**
 * @name AutoCamera
 * @author RESCHER4444
 * @description Automatically activates the camera in voice channels.
 * @version 4.2.0
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/blob/main/AutoCamera/AutoCamera.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/AutoCamera/AutoCamera.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */

module.exports = class AutoCameraPlugin {
    constructor() {
        this._config = {
            info: {
                name: "AutoCamera",
                authors: [
                    {
                        name: "RESCHER4444",
                        discord_id: "616297463409672193",
                    }
                ],
                version: "4.2.0",
                description: "Automatically activates the camera in voice channels.",
            },
            main: "index.js",
        };

        this.interval = null;
        this.menuObserver = null;
        this.menuButton = null;
        this.statusDot = null;
        this.updateUrl = "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/AutoCamera/AutoCamera.plugin.js";
    }

    start() {
        this.checkForUpdates();
        this.activateCameraInterval();
        this.observeMenu();
    }

    stop() {
        this.stopCameraInterval();
        if (this.menuObserver) {
            this.menuObserver.disconnect();
            this.menuObserver = null;
        }
        this.removeMenuButton();
    }

    activateCameraInterval() {
        if (this.interval) return;
        if (this.enabled) {
            this.interval = setInterval(() => this.tryActivateCamera(), 10000);
        }
    }

    stopCameraInterval() {
        if (!this.interval) return;
        clearInterval(this.interval);
        this.interval = null;
    }

    toggleAutoCamera() {
        this.enabled = !this.enabled;
        BdApi.saveData("AutoCamera", "enabled", this.enabled);
        if (this.enabled) this.activateCameraInterval();
        else this.stopCameraInterval();
        this.updateButton();
    }

    observeMenu() {
        this.menuObserver = new MutationObserver(() => {
            const menuContainer = document.querySelector(".scroller_c1e9c4.thin_d125d2.scrollerBase_d125d2");
            if (menuContainer) {
                if (!document.getElementById("autoCameraMenuButton")) {
                    this.injectMenuButton(menuContainer);
                }
            }
        });

        this.menuObserver.observe(document.body, { childList: true, subtree: true });
    }

    injectMenuButton(menuContainer) {
        const buttonDiv = document.createElement("div");
        buttonDiv.id = "autoCameraMenuButton";
        buttonDiv.className = "item_c1e9c4 labelContainer_c1e9c4 colorDefault_c1e9c4";
        buttonDiv.setAttribute("role", "menuitem");
        buttonDiv.setAttribute("tabindex", "0");
        buttonDiv.style.cursor = "pointer";

        const labelDiv = document.createElement("div");
        labelDiv.className = "label_c1e9c4";
        labelDiv.textContent = "Auto Camera";

        buttonDiv.appendChild(labelDiv);

        const iconDiv = document.createElement("div");
        iconDiv.className = "iconContainer_c1e9c4";
        iconDiv.style.width = "20px";
        iconDiv.style.height = "20px";
        iconDiv.style.marginLeft = "auto";
        iconDiv.style.display = "flex";
        iconDiv.style.alignItems = "center";
        iconDiv.style.justifyContent = "center";

        this.statusDot = document.createElement("div");
        this.statusDot.style.width = "10px";
        this.statusDot.style.height = "10px";
        this.statusDot.style.borderRadius = "50%";
        this.statusDot.style.backgroundColor = this.enabled ? "#43b581" : "#f04747";

        iconDiv.appendChild(this.statusDot);
        buttonDiv.appendChild(iconDiv);

        buttonDiv.addEventListener("click", () => {
            this.toggleAutoCamera();
        });

        menuContainer.appendChild(buttonDiv);
        this.menuButton = buttonDiv;
    }

    removeMenuButton() {
        if (this.menuButton) {
            this.menuButton.remove();
            this.menuButton = null;
        }
    }

    updateButton() {
        if (!this.menuButton) return;
        this.statusDot.style.backgroundColor = this.enabled ? "#43b581" : "#f04747";
    }

    tryActivateCamera() {
        const cameraButton = document.querySelector('button[aria-label="Kamera anschalten"]');
        if (cameraButton) {
            const rect = cameraButton.getBoundingClientRect();
            if (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            ) {
                cameraButton.click();
            }
        }
    }

    checkForUpdates() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", this.updateUrl, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const latestCode = xhr.responseText;
                    const latestVersionMatch = latestCode.match(/@version\s+([\d.]+)/);
                    if (latestVersionMatch) {
                        const latestVersion = latestVersionMatch[1];
                        const currentVersion = this._config.info.version;
                        if (latestVersion !== currentVersion) {
                            console.log(`AutoCamera: Neue Version gefunden (${latestVersion}). Aktualisiere...`);
                            this.updatePlugin(latestCode);
                        } else {
                            console.log("AutoCamera: Keine neue Version verfügbar.");
                        }
                    }
                } else {
                    console.error("AutoCamera: Update-Check fehlgeschlagen:", xhr.statusText);
                }
            }
        };
        xhr.send();
    }

    updatePlugin(newCode) {
        try {
            const fs = require('fs');
            const path = require('path');
            // Plugin-Dateipfad ermitteln (kann je nach Installation variieren!)
            const pluginPath = path.join(__dirname, "AutoCamera.plugin.js");
            fs.writeFileSync(pluginPath, newCode, "utf8");
            console.log("AutoCamera: Plugin erfolgreich aktualisiert. Bitte Discord neu starten.");
        } catch (error) {
            console.error("AutoCamera: Fehler beim Aktualisieren des Plugins:", error);
        }
    }
};
