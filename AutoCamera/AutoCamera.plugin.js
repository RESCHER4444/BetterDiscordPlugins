/**
 * @name AutoCamera
 * @author RESCHER4444
 * @description Automatically activates the camera in voice channels.
 * @version 4.0
 * @source https://github.com/RESCHER4444/BetterDiscordPlugins/blob/main/AutoCamera/AutoCamera.plugin.js
 * @updateUrl https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/AutoCamera/AutoCamera.plugin.js
 * @authorLink https://github.com/RESCHER4444
 */

module.exports = class AutoCameraPlugin {
    constructor() {
        this._config = {
            info: {
                name: "AutoCameraPlugin",
                authors: [
                    {
                        name: "RESCHER4444",
                        discord_id: "616297463409672193",
                    }
                ],
                version: "4.0",
                description: "Automatically activates the camera in voice channels.",
            },
            main: "index.js",
        };

        this.intervalId = null;
        this.cameraButton = null;
        this.updateUrl = "https://raw.githubusercontent.com/RESCHER4444/BetterDiscordPlugins/main/AutoCamera/AutoCamera.plugin.js";
    }

    start() {
        console.log("AutoCameraPlugin started.");
        this.checkForUpdates();
        this.cameraButton = document.querySelector('button[aria-label="Kamera anschalten"]');
        this.checkAndActivateCamera();
    }

    stop() {
        console.log("AutoCameraPlugin stopped.");

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("Interval stopped.");
        }

        if (this.cameraButton) {
            this.cameraButton.removeEventListener('click', this.handleClick);
        }
    }

    handleClick = () => {
        console.log("Camera button clicked.");
    }

    checkAndActivateCamera() {
        this.intervalId = setInterval(() => {
            try {

                const cameraButton = document.querySelector('button[aria-label="Kamera anschalten"]');
                if (cameraButton) {
                    const rect = cameraButton.getBoundingClientRect();
                    if (rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth) {
                        if (cameraButton !== this.cameraButton) {
                            this.cameraButton = cameraButton;
                            this.cameraButton.addEventListener('click', this.handleClick);
                        }
                        cameraButton.click();
                        console.log("Camera activated.");
                    } else {
                        console.log("Camera button is not visible.");
                    }
                } else {
                    console.log("Camera button not found. Current DOM:", document.body.innerHTML);
                }
            } catch (error) {
                console.error("Error activating camera:", error);
            }
        }, 10000);
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
            const pluginPath = path.join(__dirname, 'AutoCamera.plugin.js');
            fs.writeFileSync(pluginPath, newCode, 'utf8');
            console.log("Plugin successfully updated. Please restart Discord to apply the changes.");
        } catch (error) {
            console.error("Error updating plugin:", error);
        }
    }
};
