import { context } from "./context";
import { Tool } from "./tools/tool";
import { listenPullEvents } from "./listeners/pull-listener";
import index from "./index";

export async function exec(args: string[]) {
    const cmd = args[0];
    const def = index[cmd];
    if (!def) throw Error(`Command "${cmd}" not found`);
    const module = await import(def.path);
    const tool = new module[def.className](context) as Tool;
    listenPullEvents(context.events);
    return tool.run(args.slice(1));
}
