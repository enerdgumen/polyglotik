import { Engine } from "../engine";
import { Project } from "../project";
import { Tool } from "./tool";

export abstract class DockerTool implements Tool {
    abstract parent: string;
    abstract image: string;
    abstract command: string;

    constructor(protected engine: Engine, protected project: Project) {}

    async run(args: string[]) {
        const { name } = this.project;
        const { version } = this.project.options(this.parent);
        const container = await this.engine
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
