import { injectable } from "tsyringe";
import * as Docker from "dockerode";
import { Container, ContainerBuilder, Image, Engine } from "./engine";

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
    private stdin?: NodeJS.ReadableStream;
    private stdout?: NodeJS.WritableStream;
    private stderr?: NodeJS.WritableStream;

    constructor(
        private docker: Docker,
        private name: string,
        private image: Image
    ) {}

    attachStdStreams(): ContainerBuilder {
        this.stdin = process.stdin.isTTY ? undefined : process.stdin;
        this.stdout = process.stdout;
        this.stderr = process.stderr;
        return this;
    }

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

    useHostDocker(): ContainerBuilder {
        const path = "/var/run/docker.sock";
        this.Mounts.push({
            Type: "bind",
            Source: path,
            Target: path
        });
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
        const container = await this.docker.createContainer({
            AttachStdin: Boolean(this.stdin),
            Cmd: [cmd, args].flat(),
            Image: `${image.name}:${image.tag || "latest"}`,
            HostConfig: {
                NetworkMode,
                Mounts
            },
            OpenStdin: Boolean(this.stdin),
            StdinOnce: true,
            Tty: false,
            User,
            WorkingDir
        });
        await this.attachStreams(container);
        await container.start();
        return new DockerContainer(container);
    }

    private async attachStreams(container: Docker.Container) {
        if (this.stdin || this.stdout || this.stderr) {
            const stream = await container.attach({
                stream: true,
                hijack: Boolean(this.stdin),
                stdin: Boolean(this.stdin),
                stdout: Boolean(this.stdout),
                stderr: Boolean(this.stderr)
            });
            if (this.stdout || this.stderr) {
                container.modem.demuxStream(stream, this.stdout, this.stderr);
            }
            if (this.stdin) {
                this.stdin.pipe(stream);
            }
        }
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
