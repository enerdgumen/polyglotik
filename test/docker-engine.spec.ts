import { equal, notEqual } from "assert";
import { DockerEngine } from "../src/docker-engine";
import { waitAndRemove } from "../src/containers";
import { Readable, PassThrough } from "stream";
import * as Docker from "dockerode";
import { EventEmitter } from "events";

describe("DockerEngine", () => {
    const docker = new Docker();
    const events = new EventEmitter();
    const engine = new DockerEngine(docker, events);

    describe("container", () => {
        it("emits stdout", async function () {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer(undefined, { name: "busybox", tag: "1" })
                .stdoutTo(stdout)
                .start("echo", ["-n", "dog"]);
            await waitAndRemove(container);
            equal(capture.text, "dog");
        });

        it("emits stderr", async function () {
            const [capture, stderr] = captureStream();
            const container = await engine
                .newContainer(undefined, { name: "busybox", tag: "1" })
                .whenImageNotFound(engine.pullImage)
                .stderrTo(stderr)
                .start("logger", ["-s", "dog"]);
            await waitAndRemove(container);
            equal(capture.text, "root: dog\n");
        });

        it("consumes stdin", async function () {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer(undefined, { name: "busybox", tag: "1" })
                .stdinFrom(Readable.from("dog"))
                .stdoutTo(stdout)
                .start("cat", []);
            await waitAndRemove(container);
            equal(capture.text, "dog");
        });

        it("runs as root by default", async function () {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer(undefined, { name: "busybox", tag: "1" })
                .stdoutTo(stdout)
                .start("id", ["-u", "-n"]);
            await waitAndRemove(container);
            equal(capture.text, "root\n");
        });

        it("can run as current user", async function () {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer(undefined, { name: "busybox", tag: "1" })
                .useHostUser()
                .stdoutTo(stdout)
                .start("id", ["-u", "-n"]);
            await waitAndRemove(container);
            notEqual(capture.text, "root\n");
        });

        it("can attach current working directory", async function () {
            const container = await engine
                .newContainer(undefined, { name: "busybox", tag: "1" })
                .useHostWorkingDir()
                .start("ls", ["package.json"]);
            const status = await waitAndRemove(container);
            equal(status, 0);
        });

        it("can connect to host docker", async function () {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer(undefined, { name: "docker", tag: "19" })
                .useHostDocker()
                .stdoutTo(stdout)
                .start("docker", ["run", "--rm", "busybox:1", "echo", "dog"]);
            const status = await waitAndRemove(container);
            equal(capture.text, "dog\n");
        });

        it("waits and returns the exit status code", async function () {
            const container = await engine
                .newContainer(undefined, { name: "busybox", tag: "1" })
                .start("false", []);
            const status = await waitAndRemove(container);
            equal(status, 1);
        });

        it("can auto-pull a missing image", async function () {
            this.timeout(15000);
            let pulled = false;
            events.on("pull-started", () => (pulled = true));
            const image = { name: "busybox", tag: "1" };
            await docker.getImage("busybox:1").remove();
            await engine.pullImage(image);
            const container = await engine
                .newContainer(undefined, image)
                .start("false", []);
            const status = await waitAndRemove(container);
            equal(status, 1);
            equal(pulled, true);
        });
    });
});

function captureStream(): [{ text: string }, PassThrough] {
    const stream = new PassThrough();
    const capture = { text: "" };
    stream.on("data", (data) => (capture.text += data.toString()));
    return [capture, stream];
}
