import { inject, injectable } from "tsyringe";
import { Engine } from "../engine";
import { NodeProject } from "./node";
import { Tool } from "./tool";

@injectable()
class Yarn implements Tool {
    constructor(
        @inject("Engine") private engine: Engine,
        @inject("Project") private project: NodeProject
    ) {}

    async run(args: string[]) {
        const { name, node } = this.project;
        const container = await this.engine
            .newContainer(`polyglotik/${name}/node`, {
                name: "node",
                tag: node && node.version
            })
            .useHostNetwork()
            .useHostUser()
            .useHostWorkingDir()
            .start("yarn", args);
        const statusCode = await container.wait();
        await container.remove();
        return statusCode;
    }
}

export default Yarn;
