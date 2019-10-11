//
// version.ts
// Protected under Canadian Copyright Laws
//
// Written by: Tyler Akins (2019/09/24)
//


import * as config from "../../config.json";


var toggle = false,
    last_ran = null;


export function VERSION_COMMAND (client: any, target: string) {

    if (!config.bot.GLOBAL_CMD_COOLDOWN) {
        if (last_ran != null) {
            if (Date.now() - last_ran < config.bot.CMD_COOLDOWN * 1000) {
                return;
            };
        };
        last_ran = Date.now();
    };


    let buffer: string = "";
    if (toggle) { buffer = " "; toggle = false; } else { toggle = true; }

    client.say(target, `Bot Version${buffer}: ${config.bot.VERSION}`)
};