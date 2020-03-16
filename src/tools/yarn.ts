import * as Docker from "dockerode";
import { Container } from "dockerode";
import { readProject } from "../project";
import { NodeProject } from "./node";

export async function run(args: string[]) {
    const project = readProject() as NodeProject;
    const docker = new Docker();
    const image = `node:${(project.node && project.node.version) || "latest"}`;
    const cmd = ["yarn", args].flat();
    const createOptions = {
        HostConfig: {
            NetworkMode: "host",
            Mounts: [
                {
                    Type: "bind",
                    Source: process.cwd(),
                    Target: "/work"
                }
            ]
        },
        User: `${process.getuid()}:${process.getgid()}`,
        WorkingDir: "/work"
    };
    const [{ StatusCode }, container]: [any, Container] = await docker.run(
        image,
        cmd,
        process.stdout,
        createOptions
    );
    await container.commit({
        repo: `polyglotik/${project.name}/node`
    });
    await container.remove();
    return StatusCode;
}
