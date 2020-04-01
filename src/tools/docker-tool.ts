import { WithEngine } from "../engine";
import { WithProject } from "../project";
import { Tool } from "./tool";

export abstract class DockerTool implements Tool {
    abstract parent: string;
    abstract image: string;
    abstract command: string;

    constructor(protected context: WithEngine & WithProject) {}

    async run(args: string[]) {
        const { engine, project } = this.context;
        const { name } = project;
        const { version } = project.options(this.parent);
        const container = await engine
            .newContainer(`polyglotik/${name}/${this.parent}`, {
                name: this.image,
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
