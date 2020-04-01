import { context } from "./context";
import { Tool } from "./tools/tool";
import { listenPullEvents } from "./listeners/pull-listener";
import index from "./index";

async function main() {
    const args = process.argv.slice(2);
    const cmd = args[0];
    const def = index[cmd];
    if (!def) throw Error(`Command "${cmd}" not found`);
    const module = await import(def.path);
    const tool = new module[def.className](context) as Tool;
    listenPullEvents(context.events);
    const status = await tool.run(args.slice(1));
    process.exit(status);
}

main().catch(err => {
    console.error(err);
    process.exit(101);
});
