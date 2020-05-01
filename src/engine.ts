export type Image = {
    name: string;
    tag: string | null;
};

export interface WithEngine {
    engine: Engine;
}

export interface Engine {
    newContainer(name: string, image: Image): ContainerBuilder;
    newImage(image: Image): ImageBuilder;
    pullImage(image: Image): Promise<void>;
}

export interface ContainerBuilder {
    attachStdStreams(): ContainerBuilder;
    env(vars: Record<string, string>): ContainerBuilder;
    useHostWorkingDir(): ContainerBuilder;
    useHostUser(): ContainerBuilder;
    useHostNetwork(): ContainerBuilder;
    useHostDocker(): ContainerBuilder;
    mount(source: string, target: string): ContainerBuilder;
    stdinFrom(stream: NodeJS.ReadableStream): ContainerBuilder;
    stdoutTo(stream: NodeJS.WritableStream): ContainerBuilder;
    stderrTo(stream: NodeJS.WritableStream): ContainerBuilder;
    whenImageNotFound(handler: ImageNotFoundHandler): ContainerBuilder;
    start(cmd: string, args: string[]): Promise<Container>;
}

export type StatusCode = number;
export type ImageNotFoundHandler = (image: Image) => Promise<void>;

export interface Container {
    wait(): Promise<StatusCode>;
    commit(image: Image): Promise<void>;
    remove(): Promise<void>;
}

export interface ImageBuilder {
    from(image: Image): Promise<void>;
    run(cmd: string, args: string[]): Promise<void>;
}
