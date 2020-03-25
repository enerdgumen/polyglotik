import { inject, injectable } from "tsyringe";
import { Engine } from "../engine";
import { Project } from "../project";
import { Tool } from "./tool";

@injectable()
export class Node implements Tool {
    command = "node";

    constructor(
        @inject("Engine") private engine: Engine,
        @inject("Project") private project: Project
    ) {}

    async run(args: string[]) {
        const { name } = this.project;
        const { version } = this.project.options("node");
        const container = await this.engine
            .newContainer(`polyglotik/${name}/node`, {
                name: "node",
                tag: version
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

@injectable()
export class Npm extends Node {
    command = "npm";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}

@injectable()
export class Npx extends Node {
    command = "npx";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}

@injectable()
export class Yarn extends Node {
    command = "yarn";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}
