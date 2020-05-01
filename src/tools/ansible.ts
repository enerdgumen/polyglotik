import { WithProject } from "../project";
import { WithEngine, ContainerBuilder } from "../engine";
import { DockerTool } from "./docker-tool";

export class AnsiblePlaybook extends DockerTool {
    parent = "ansible";
    image = "polyglotik-ansible";
    command = "ansible-playbook";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }

    async init() {
        const { engine, project } = this.context;
        const { version } = project.options(this.parent);
        const { from, run } = engine.newImage({
            name: this.image,
            tag: version,
        });
        await from({ name: "python", tag: "2.7" });
        await run("apt-get", ["update"]);
        await run("apt-get", ["install", "sshpass"]);
        await run("pip", [
            "install",
            version === "latest" ? "ansible" : `ansible==${version}`,
        ]);
    }

    async configure(container: ContainerBuilder) {}
}
