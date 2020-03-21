import { inject, injectable } from "tsyringe";
import { Engine } from "../engine";
import { Project } from "../project";
import { Tool } from "./tool";

export interface NodeProject extends Project {
    node: null | {
        version: null | string;
    };
}

@injectable()
class Node implements Tool {
    command = "node";

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
            .start(this.command, args);
        const statusCode = await container.wait();
        await container.remove();
        return statusCode;
    }
}

export default Node;
