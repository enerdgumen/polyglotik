import { context } from "./context";
import { Tool } from "./tools/tool";
import { listenPullEvents } from "./listeners/pull-listener";
import index from "./index";

async function execTool(args: string[]) {
    const cmd = args[0];
    const def = index[cmd];
    if (!def) throw Error(`Command "${cmd}" not found`);
    const module = await import(def.path);
    const tool = new module[def.className](context) as Tool;
    listenPullEvents(context.events);
    return tool.run(args.slice(1));
}

export function exec(args: string[]) {
    execTool(args)
        .then(status => {
            process.exit(status);
        })
        .catch(err => {
            console.error(err);
            process.exit(101);
        });
}
