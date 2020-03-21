import "reflect-metadata";
import { container } from "./context";
import { Tool } from "./tools/tool";

async function main() {
    const args = process.argv.slice(2);
    const cmd = args[0];
    const { default: ConcreteTool } = await import(`./tools/${cmd}`);
    const tool = container.resolve<Tool>(ConcreteTool);
    const status = await tool.run(args.slice(1));
    process.exit(status);
}

main().catch(err => {
    console.error(err);
    process.exit(101);
});
