import { injectable } from "tsyringe";
import * as Docker from "dockerode";
import { Container, ContainerBuilder, Image, Engine } from "./engine";
import { ReadStream } from "fs";

@injectable()
export class DockerEngine implements Engine {
    constructor(private docker: Docker) {}

    static default() {
        return new DockerEngine(new Docker());
    }

    newContainer(name: string, image: Image): ContainerBuilder {
        return new DockerContainerBuilder(this.docker, name, image);
    }
}

class DockerContainerBuilder implements ContainerBuilder {
    private NetworkMode?: string;
    private User?: string;
    private Mounts: Docker.MountSettings[] = [];
    private WorkingDir?: string;
    private stdin?: NodeJS.ReadableStream = process.stdin.isTTY
        ? undefined
        : process.stdin;
    private stdout: NodeJS.WritableStream = process.stdout;
    private stderr: NodeJS.WritableStream = process.stderr;

    constructor(
        private docker: Docker,
        private name: string,
        private image: Image
    ) {}

    useHostWorkingDir(): ContainerBuilder {
        this.Mounts.push({
            Type: "bind",
            Source: process.cwd(),
            Target: "/work"
        });
        this.WorkingDir = "/work";
        return this;
    }

    useHostUser(): ContainerBuilder {
        this.User = `${process.getuid()}:${process.getgid()}`;
        return this;
    }

    useHostNetwork(): ContainerBuilder {
        this.NetworkMode = "host";
        return this;
    }

    stdinFrom(stream: NodeJS.ReadableStream): ContainerBuilder {
        this.stdin = stream;
        return this;
    }

    stdoutTo(stream: NodeJS.WritableStream): ContainerBuilder {
        this.stdout = stream;
        return this;
    }

    stderrTo(stream: NodeJS.WritableStream): ContainerBuilder {
        this.stderr = stream;
        return this;
    }

    async start(cmd: string, args: string[]): Promise<Container> {
        const { image } = this;
        const { Mounts, NetworkMode, User, WorkingDir } = this;
        const attachStdin = Boolean(this.stdin);
        const container = await this.docker.createContainer({
            AttachStdin: attachStdin,
            Cmd: [cmd, args].flat(),
            Image: `${image.name}:${image.tag || "latest"}`,
            HostConfig: {
                NetworkMode,
                Mounts
            },
            OpenStdin: attachStdin,
            StdinOnce: true,
            Tty: false,
            User,
            WorkingDir
        });
        const stream = await container.attach({
            stream: true,
            hijack: true,
            stdin: attachStdin,
            stdout: true,
            stderr: true
        });
        container.modem.demuxStream(stream, this.stdout, this.stderr);
        if (this.stdin) {
            this.stdin.pipe(stream);
        }
        await container.start();
        return new DockerContainer(container);
    }
}

class DockerContainer implements Container {
    constructor(private container: Docker.Container) {}

    async wait(): Promise<number> {
        const { StatusCode } = await this.container.wait();
        return StatusCode;
    }

    async commit(): Promise<void> {
        await this.container.commit();
    }

    async remove(): Promise<void> {
        await this.container.remove();
    }
}
