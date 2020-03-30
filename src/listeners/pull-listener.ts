import { injectable } from "tsyringe";
import { EventEmitter } from "events";
import * as ora from "ora";

@injectable()
export class PullListener {
    constructor(events: EventEmitter) {
        let spinner = ora();
        events
            .on("pull-started", ({ image }) => {
                spinner.text = `Pulling ${image}...`;
                spinner.start();
            })
            .on("pull-progress", event => {
                const { image, progressDetail, status } = event;
                if (progressDetail && progressDetail.total) {
                    const { current, total } = progressDetail;
                    const progress = Math.round((100 * current) / total);
                    spinner.text = `Pulling ${image}... (${status.toLowerCase()} ${progress}%)`;
                }
            })
            .on("pull-completed", () => {
                spinner.stop();
            });
    }
}
