import { inject, injectable } from "tsyringe";
import { Engine } from "../engine";
import { Project } from "../project";
import { Tool } from "./tool";

@injectable()
export class Ruby implements Tool {
    command = "ruby";

    constructor(
        @inject("Engine") private engine: Engine,
        @inject("Project") private project: Project
    ) {}

    async run(args: string[]) {
        const { name } = this.project;
        const { version } = this.project.options("ruby");
        const container = await this.engine
            .newContainer(`polyglotik/${name}/ruby`, {
                name: "ruby",
                tag: version
            })
            .attachStdStreams()
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
export class Bundle extends Ruby {
    command = "bundle";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}
