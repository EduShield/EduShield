import path from 'path';
import cors from 'cors';
import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';

dotenv.config();

const server = express();
const port = process.env.PORT || 3000;

if (process.env?.ENV?.toLocaleLowerCase() === 'dev') {
    const liveReloadServer = livereload.createServer();

    liveReloadServer.watch('public');
    
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });

    server.use(connectLiveReload());

    server.use(cors({
        origin: [`http://localhost:${port}`, `http://127.0.0.1:${port}`]
    }));

    console.log(chalk.yellowBright('Live Reload Enabled'));
}

server.use(express.static('public'));

server.get('/*', (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

server.listen(port, () => {
    console.log(`${chalk.greenBright('Server Listening On Port')} ${chalk.greenBright.bold(port)}\n${chalk.magentaBright('Visit:')} ${chalk.blue('http://localhost:' + port)}`);
});