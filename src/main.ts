//
// main.ts
// Protected under Canadian Copyright Laws
//
// Written by: Tyler Akins (2019/11/06 - 2019/11/17)
//

import { run_discord } from "./services/discord_handler";
import { run_twitch } from "./services/twitch_handler";
import { run_tests } from "./services/test_runner";
import { LOAD_CONFIG } from "./utils/Config";


let config = LOAD_CONFIG();
let args = process.argv.slice(2);


// Not enough arguments
if (args.length < 1) {
    console.error(
        "Too few arguments, to get help with running the program, go to:",
        config.WEBSITE + "/cli-args"
    );
    process.exit(1);
}

// TODO: Add an init_prog_data system so we don't need to store %links% in git
if (args.includes("--test")) {
    run_tests(args.includes("--silent"));
    process.exit(0)
}


if (args.includes("--twitch")) {
    run_twitch();
};


if (args.includes("--discord")) {
    run_discord();
};


if (args.includes("--compile-docs")) {
    // TODO: Create a specific file for each command object with it's description, syntax, etc.
    // TODO: Set `{pre}` in all docs to be the prefix from the config
};