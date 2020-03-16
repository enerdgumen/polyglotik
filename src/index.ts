const args = process.argv.slice(2);
const cmd = args[0];
const tool = require(`./${cmd}`);
tool.run(args.slice(1)).then((status: number) => {
    process.exit(status);
});
