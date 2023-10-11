const SpeakerVolumeControlCapability = require("../../../core/capabilities/SpeakerVolumeControlCapability");
const fs = require("fs");
const exec = require('child_process');

/**
 * @extends SpeakerVolumeControlCapability<import("../RoborockValetudoRobot")>
 */
class RoborockSpeakerVolumeControlCapability extends SpeakerVolumeControlCapability {
    /**
     * Returns the current voice volume as percentage
     *
     * @returns {Promise<number>}
     */
    async getVolume() {
        const res = await this.robot.sendCommand("get_sound_volume", [], {});

        return res[0];
    }

    /**
     * Sets the speaker volume
     *
     * @param {number} value
     * @returns {Promise<void>}
     */
    async setVolume(value) {
        await this.robot.sendCommand("change_sound_volume", [value], {});

        // If oucher is installed, set the volume there too
        if (fs.existsSync("/mnt/data/oucher/oucher.yml")) {
            const oucherConfig = fs.readFileSync("/mnt/data/oucher/oucher.yml", "utf-8");
            const newOucherConfig = oucherConfig.replace(/volume: \d+/g, `volume: ${value}`);

            fs.writeFileSync("/mnt/data/oucher/oucher.yml", newOucherConfig);

            // Find the oucher process PID if it is running and then restart it
            try {
                const pid = exec.execSync("pidof oucher").toString().trim();
                // if pid is not empty, kill it
                if (pid.length > 0) {
                    // if multiple pids are returned, kill them all by splitting them at the spaces and then killing them one by one
                    pid.split(" ").forEach((pid) => {
                        exec.execSync(`kill ${pid}`);
                    });
                    // now restart oucher
                    exec.execSync("/mnt/data/oucher/oucher");
                }
            } catch (e) {
                // oucher is not running, nothing to do
            }
        }
    }
}

module.exports = RoborockSpeakerVolumeControlCapability;
