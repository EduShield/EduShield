import fs from "fs";
import path from 'path';
import cors from 'cors';
import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';

dotenv.config();

const server = express();
const port = process.env?.PORT || 3000;
const env = process.env?.ENV?.toLocaleLowerCase();

if (env === 'dev' || env === 'development') {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch('public');
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });
    server.use(connectLiveReload());
    server.use(cors({
        origin: '*'
    }));
    console.log(chalk.yellowBright('Live Reload Enabled'));
}

server.use(express.static('public'));

server.get('/*', (req, res) => {
    const fileName = `${req.url.substring(1)}.html`;
    const filePath = (fileName) => path.resolve('public', fileName);
    if (fs.existsSync(filePath(fileName))) {
        res.sendFile(filePath(fileName));
    } else {
        res.status(404).sendFile(filePath('404.html'));
    }
});

server.listen(port, () => {
    console.log(`${chalk.greenBright('Server Listening On Port')} ${chalk.greenBright.bold(port)}\n${chalk.magentaBright('Visit:')} ${chalk.blue('http://localhost:' + port)}`);
});