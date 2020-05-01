import * as Docker from "dockerode";
import { EventEmitter } from "events";
import {
    Container,
    ContainerBuilder,
    Image,
    Engine,
    ImageNotFoundHandler,
    ImageBuilder,
} from "./engine";
import { removeAfter, waitSuccess } from "./containers";

export class DockerEngine implements Engine {
    constructor(private docker: Docker, private events: EventEmitter) {}

    newContainer(name: string | undefined, image: Image): ContainerBuilder {
        return new DockerContainerBuilder(this.docker, name, image);
    }

    newImage(image: Image): ImageBuilder {
        return new DockerImageBuilder(this, image);
    }

    // sta nel prototype?!?
    pullImage = (image: Image): Promise<void> => {
        const { name, tag } = image;
        return new Promise((resolve, reject) => {
            this.events.emit("pull-started", { image });
            const onFinished = (err: Error | null) => {
                this.events.emit("pull-completed");
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            };
            const onProgress = (event: any) => {
                this.events.emit(
                    "pull-progress",
                    Object.assign(event, { image })
                );
            };
            this.docker
                .pull(`${name}:${tag || "latest"}`, {})
                .then((stream) => {
                    this.docker.modem.followProgress(
                        stream,
                        onFinished,
                        onProgress
                    );
                })
                .catch(onFinished);
        });
    };
}

class DockerContainerBuilder implements ContainerBuilder {
    private Env: string[] = [];
    private NetworkMode?: string;
    private User?: string;
    private Mounts: Docker.MountSettings[] = [];
    private WorkingDir?: string;
    private stdin?: NodeJS.ReadableStream;
    private stdout?: NodeJS.WritableStream;
    private stderr?: NodeJS.WritableStream;
    private Tty = false;
    private notFoundHandler?: ImageNotFoundHandler;

    constructor(
        private docker: Docker,
        private name: string | undefined,
        private image: Image
    ) {}

    attachStdStreams(): ContainerBuilder {
        this.stdin = process.stdin;
        this.stdout = process.stdout;
        this.stderr = process.stderr;
        this.Tty = Boolean(process.stdin.isTTY);
        return this;
    }

    env(vars: Record<string, string>): ContainerBuilder {
        for (const name in vars) {
            this.Env.push(`${name}=${vars[name]}`);
        }
        return this;
    }

    useHostWorkingDir(): ContainerBuilder {
        this.Mounts.push({
            Type: "bind",
            Source: process.cwd(),
            Target: "/work",
        });
        this.WorkingDir = "/work";
        return this;
    }

    useHostUser(): ContainerBuilder {
        if (process.getuid) {
            this.User = `${process.getuid()}:${process.getgid()}`;
        }
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
            Target: path,
        });
        return this;
    }

    mount(source: string, target: string): ContainerBuilder {
        this.Mounts.push({
            Type: "bind",
            Source: source,
            Target: target,
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

    whenImageNotFound(handler: ImageNotFoundHandler): ContainerBuilder {
        this.notFoundHandler = handler;
        return this;
    }

    async start(cmd: string, args: string[]): Promise<Container> {
        const { image } = this;
        const { Env, Mounts, NetworkMode, User, WorkingDir, Tty } = this;
        const dockerImage = `${image.name}:${image.tag || "latest"}`;
        const create = () =>
            this.docker.createContainer({
                name: this.name,
                AttachStdin: Boolean(this.stdin),
                Cmd: [cmd, args].flat(),
                Env,
                Image: dockerImage,
                HostConfig: {
                    NetworkMode,
                    Mounts,
                },
                OpenStdin: Boolean(this.stdin),
                StdinOnce: true,
                Tty,
                User,
                WorkingDir,
            });
        const container = await create().catch((err) => {
            if (err.statusCode === 404 && this.notFoundHandler) {
                return this.notFoundHandler(image).then(create);
            }
            throw err;
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
                stderr: Boolean(this.stderr),
            });
            if (this.Tty) {
                if (this.stdout) {
                    stream.pipe(this.stdout);
                }
            } else if (this.stdout || this.stderr) {
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
        process.once("SIGINT", () => {
            this.container.kill().catch((err) => {
                if (err.statusCode !== 404) throw err;
            });
        });
        const { StatusCode } = await this.container.wait();
        return StatusCode;
    }

    async commit(image: Image): Promise<void> {
        await this.container.commit({ repo: image.name, tag: image.tag });
    }

    async remove(): Promise<void> {
        await this.container.remove();
    }
}

class DockerImageBuilder implements ImageBuilder {
    private currentImage?: Image;

    constructor(private engine: Engine, private image: Image) {}

    from = async (image: Image) => {
        this.currentImage = image;
    };

    run = async (cmd: string, args: string[]) => {
        if (!this.currentImage) throw Error("missing fromImage");
        const { engine, image } = this;
        const container = await engine
            .newContainer(`${image.name}-build`, this.currentImage)
            .attachStdStreams()
            .whenImageNotFound((image) => engine.pullImage(image))
            .start(cmd, args);
        await removeAfter(container, async () => {
            await waitSuccess(container);
            await container.commit(image);
            this.currentImage = image;
        });
    };
}
