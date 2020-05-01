import { Container } from "./engine";

export async function removeAfter<T>(
    container: Container,
    action: () => Promise<T>
) {
    try {
        return await action();
    } finally {
        await container.remove();
    }
}

export function waitAndRemove(container: Container) {
    return removeAfter(container, () => container.wait());
}

export async function waitSuccess(container: Container) {
    const status = await container.wait();
    if (status !== 0) throw Error(`Unexpected exit status: ${status}`);
}
