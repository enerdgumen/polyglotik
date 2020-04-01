export type Image = {
    name: string;
    tag: string | null;
};

export interface WithEngine {
    engine: Engine;
}

export interface Engine {
    newContainer(name: string, image: Image): ContainerBuilder;
}

export interface ContainerBuilder {
    attachStdStreams(): ContainerBuilder;
    useHostWorkingDir(): ContainerBuilder;
    useHostUser(): ContainerBuilder;
    useHostNetwork(): ContainerBuilder;
    useHostDocker(): ContainerBuilder;
    stdinFrom(stream: NodeJS.ReadableStream): ContainerBuilder;
    stdoutTo(stream: NodeJS.WritableStream): ContainerBuilder;
    stderrTo(stream: NodeJS.WritableStream): ContainerBuilder;
    start(cmd: string, args: string[]): Promise<Container>;
}

export type StatusCode = number;

export interface Container {
    wait(): Promise<StatusCode>;
    commit(): Promise<void>;
    remove(): Promise<void>;
}
