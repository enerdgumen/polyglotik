import { exec } from "./exec";

function parseArgs(): string[] {
    const args = process.argv.slice(2);
    return args[0] === "polyglotik" ? args.slice(1) : args;
}

const args = parseArgs();
if (args.length === 0) {
    console.error("Missing command");
    process.exit(102);
}
exec(args)
    .then((status) => {
        process.exit(status);
    })
    .catch((err) => {
        console.error(err);
        process.exit(101);
    });
