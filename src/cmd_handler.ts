//
// cmd_handler.ts
// Protected under Canadian Copyright Laws
//
// Written by: Tyler Akins (2019/11/06 - 2019/11/07)
//


/* Imports */
import { Command, Confirmation } from "./utils/Command";
import { LOAD_CONFIG } from "./utils/Config";
import { log } from "./utils/webhook";
import { perm } from "./constants";



var commands: Command[] = [];
export var confirms: Confirmation[] = [];
var global_last_ran: number;
var service_last_rans: any = {}


export const REGISTER_COMMAND = (metadata: cmd_metadata): boolean => {
    // Ensure command gets added correctly
    try {
        commands.push(new Command(metadata));
        return true
    } catch (error) {
        return false
    };
};



export const HANDLE_MESSAGE = (context: msg_data): string | void => {

    let config: config = LOAD_CONFIG();
    let datetime = new Date();
    let timezone = datetime.toLocaleTimeString("en-us", {timeZoneName:"short"}).split(" ")[2];
    let date = `${datetime.getFullYear()}-${datetime.getMonth()+1}-${datetime.getDate()}`
        + ` @ ${datetime.getHours()}:${datetime.getMinutes()} ${timezone}`;


    // Confirmation handling:
    // Check if we need any confirmations from users
    for (var index in confirms) {
        let confirmation = confirms[index];

        let response: CONFIRM_TYPE = confirmation.matches(
            context.user, context.channel, context.message
        );

        if (response !== "no_match") {
            confirms.splice(parseInt(index), 1)
            let cmd_resp = confirmation.run(response, context.message.split(" "));


            // Check if we have a response to log
            if (cmd_resp) {
                log({
                    title: `Log Entry (Confirmation Response):`,
                    msg: `Command:\`\`\`${context.message}\`\`\`\n\nResponse:\`\`\`${cmd_resp}\`\`\``,
                    embed: true,
                    fields: {
                        "Date:": date,
                        "Is Mod:": context.level >= perm.mod,
                        "Is Admin:": context.level >= perm.admin,
                        "Level:": context.level,
                        "Channel:": context.channel,
                        "Username": context.user,
                        "Platform": context.source,
                        "Confirm Type": response
                    },
                    no_stdout: true
                })
            }

            return cmd_resp
        };
    };



    // SECTION: Global command cooldowns
    if (config.bot.COOLDOWN_TYPE === "GLOBAL" && !context.test) {
        if (global_last_ran) {
            if (Date.now() - global_last_ran < config.bot.COOLDOWN_TIME * 1000) {
                return null;
            };
        };
        global_last_ran = Date.now()
    }
    // !SECTION: Global command cooldowns



    // SECTION: Service command cooldowns
    else if (config.bot.COOLDOWN_TYPE === "SERVICE" && !context.test) {
        if (service_last_rans[context.source]) {
            if (Date.now() - service_last_rans[context.source] < config.bot.COOLDOWN_TIME * 1000) {
                return null;
            };
        };
        service_last_rans[context.source] = Date.now()
    }
    // !SECTION: Service command cooldowns



    // Check all registered commands
    for (var cmd of commands) {

        // NOTE: Checking if message doesn't match
        if (!cmd.matches(context.message.toLowerCase())) { continue; };


        // NOTE: Permission checking
        if (context.level < cmd.level) {
            return `Invalid Permissions, you must be at least level ${cmd.level}, you are level ${context.level}.`;
        };


        // NOTE: per-command cooldown
        if (config.bot.COOLDOWN_TYPE === "COMMAND" && !context.test) {
            if (cmd.last_ran) {
                if (Date.now() - cmd.last_ran < config.bot.COOLDOWN_TIME * 1000) {
                    return null;
                };
            };
            cmd.last_ran = Date.now();
        };


        // NOTE: Case sensitivity
        if (!cmd.case_sensitive) {
            context.message = context.message.toLowerCase();
        };


        // NOTE: Argument parsing
        let args = context.message.slice(config.bot.PREFIX.length).split(" ").slice(1);
        if (args.length < cmd.mand_args) {
            return `Not enough arguments, missing argument: \`${cmd.arg_list[args.length]}\``;
        };

        let response = cmd.execute(context, args);

        log({
            title: `Log Entry:`,
            msg: `Command:\`\`\`${context.message}\`\`\`\n\nResponse:\`\`\`${response}\`\`\``,
            embed: true,
            fields: {
                "Date:": date,
                "Is Mod:": context.level >= perm.mod,
                "Is Admin:": context.level >= perm.admin,
                "Level:": context.level,
                "Channel:": context.channel,
                "Username": context.user,
                "Platform": context.source
            },
            no_stdout: true
        })
        return response;
    };
    return null;
}



/* Importing all the commands so they can register */
import "./commands/usr/ping";
import "./commands/usr/help";
import "./commands/usr/version";
import "./commands/usr/options";
import "./commands/admin/init_datafile";