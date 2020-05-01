import { Image, WithEngine, ContainerBuilder } from "../engine";
import { WithProject } from "../project";
import { waitAndRemove } from "../containers";
import { Tool } from "./tool";

export abstract class DockerTool implements Tool {
    abstract parent: string;
    abstract image: string;
    abstract command: string;

    constructor(protected context: WithEngine & WithProject) {}

    async init(image: Image) {
        const { engine } = this.context;
        await engine.pullImage(image);
    }

    async configure(container: ContainerBuilder) {
        container
            .attachStdStreams()
            .useHostNetwork()
            .useHostUser()
            .useHostWorkingDir();
    }

    async run(args: string[]) {
        const { engine, project } = this.context;
        const { name } = project;
        const { version } = project.options(this.parent);
        const builder = engine
            .newContainer(`polyglotik-${name}-${this.command}`, {
                name: this.image,
                tag: version,
            })
            .whenImageNotFound((image) => this.init(image));
        await this.configure(builder);
        const container = await builder.start(this.command, args);
        return waitAndRemove(container);
    }
}
