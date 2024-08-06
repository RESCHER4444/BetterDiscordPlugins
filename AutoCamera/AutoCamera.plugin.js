/**
 * @name AutoCamera
 * @author RESCHER4444
 * @description Aktiviert die Kamera automatisch in Sprachkanälen.
 * @version 1.2.0
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
                        name: "Dein Name",
                        discord_id: "Deine Discord ID",
                    }
                ],
                version: "1.2.0",
                description: "Aktiviert die Kamera automatisch in Sprachkanälen.",
            },
            main: "index.js",
        };

        this.intervalId = null;
        this.cameraButton = null;
    }

    start() {
        console.log("AutoCameraPlugin gestartet.");
        this.cameraButton = document.querySelector('button[aria-label="Kamera anschalten"]');
        this.checkAndActivateCamera();
    }

    stop() {
        console.log("AutoCameraPlugin gestoppt.");

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("Intervall gestoppt.");
        }

        if (this.cameraButton) {
            this.cameraButton.removeEventListener('click', this.handleClick);
        }
    }

    handleClick = () => {

        console.log("Kamera-Button geklickt.");
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
                        console.log("Kamera aktiviert.");
                    } else {
                        console.log("Kamera-Button ist nicht sichtbar.");
                    }
                } else {
                    console.log("Kamera-Button nicht gefunden.");
                }
            } catch (error) {
                console.error("Fehler beim Aktivieren der Kamera:", error);
            }
        }, 5000); 
    }
};
