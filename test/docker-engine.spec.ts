import { equal, notEqual } from "assert";
import { DockerEngine } from "../src/docker-engine";
import { Readable, PassThrough } from "stream";

describe("DockerEngine", () => {
    const engine = DockerEngine.default();

    describe("container", () => {
        it("emits stdout", async function() {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer("project", { name: "busybox", tag: "1" })
                .stdoutTo(stdout)
                .start("echo", ["-n", "dog"]);
            await container.wait();
            equal(capture.text, "dog");
        });

        it("emits stderr", async function() {
            const [capture, stderr] = captureStream();
            const container = await engine
                .newContainer("project", { name: "busybox", tag: "1" })
                .stderrTo(stderr)
                .start("logger", ["-s", "dog"]);
            await container.wait();
            equal(capture.text, "root: dog\n");
        });

        it("consumes stdin", async function() {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer("project", { name: "busybox", tag: "1" })
                .stdinFrom(Readable.from("dog"))
                .stdoutTo(stdout)
                .start("cat", []);
            await container.wait();
            equal(capture.text, "dog");
        });

        it("runs as root by default", async function() {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer("project", { name: "busybox", tag: "1" })
                .stdoutTo(stdout)
                .start("id", ["-u", "-n"]);
            await container.wait();
            equal(capture.text, "root\n");
        });

        it("can run as current user", async function() {
            const [capture, stdout] = captureStream();
            const container = await engine
                .newContainer("project", { name: "busybox", tag: "1" })
                .useHostUser()
                .stdoutTo(stdout)
                .start("id", ["-u", "-n"]);
            await container.wait();
            notEqual(capture.text, "root\n");
        });

        it("can attach current working directory", async function() {
            const container = await engine
                .newContainer("project", { name: "busybox", tag: "1" })
                .useHostWorkingDir()
                .start("ls", ["package.json"]);
            const status = await container.wait();
            equal(status, 0);
        });

        it("waits and returns the exit status code", async function() {
            const container = await engine
                .newContainer("project", { name: "busybox", tag: "1" })
                .start("false", []);
            const status = await container.wait();
            equal(status, 1);
        });
    });
});

function captureStream(): [{ text: string }, PassThrough] {
    const stream = new PassThrough();
    const capture = { text: "" };
    stream.on("data", data => (capture.text += data.toString()));
    return [capture, stream];
}
