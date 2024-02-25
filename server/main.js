import fs from 'fs';
import path from 'path';
import cors from 'cors';
import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import admin from 'firebase-admin';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import firebaseServiceAccount from './../firebaseServiceAccountKey.json' assert {type: 'json'};

dotenv.config();

const publicDir = path.resolve('public');
const app = express();
const port = process.env?.PORT || 4000;
const env = process.env?.ENV?.toLocaleLowerCase();
const gcpProjectId = firebaseServiceAccount.project_id;

admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
    storageBucket: `${gcpProjectId}.appspot.com`,
});

const auth = admin.auth();
const storage = admin.storage().bucket();

if (env === 'dev' || env === 'development') {
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(publicDir);
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });
    app.use(connectLiveReload());
    app.use(cors({
        origin: '*'
    }));
    console.log(chalk.yellowBright('Live Reload Enabled'));
}

app.use(express.json());
app.use(express.static(publicDir));

app.post('/api/visualize', (req, res) => {
    const data = req.body;
    const idToken = data.token;
    const fileName = data.fileName;
    if (!idToken) {
        res.status(403).send({ status: 'unauthorized' });
        return;
    }
    if (!fileName) {
        res.status(400).send({ status: 'bad request' });
        return;
    }
    auth.verifyIdToken(idToken)
        .then((decodedToken) => {
            console.log(decodedToken);
            const filePath = `${decodedToken.uid}/data/${fileName}`;
            storage
                .file(filePath)
                .download()
                .then((contents) => {
                    // Interact with ML Model
                    res.send({ contents: contents.toString() });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(404).send({ status: 'object not found' });
                });
        })
        .catch((error) => {
            console.log('Error verifying token: ', error);
            res.status(403).send({ status: 'unauthorized' });
        });
});

app.post('/api/ai', (req, res) => {
    const data = req.body;
    const idToken = data.token;
    const fileName = data.fileName;
    if (!idToken) {
        res.status(403).send({ status: 'unauthorized' });
        return;
    }
    if (!fileName) {
        res.status(400).send({ status: 'bad request' });
        return;
    }
    auth.verifyIdToken(idToken)
        .then((decodedToken) => {
            console.log(decodedToken);
            const filePath = `${decodedToken.uid}/data/${fileName}`;
            storage
                .file(filePath)
                .download()
                .then((contents) => {
                    // Interact with ML Model
                    res.send({ contents: contents.toString() });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(404).send({ status: 'object not found' });
                });
        })
        .catch((error) => {
            console.log('Error verifying token: ', error);
            res.status(403).send({ status: 'unauthorized' });
        });
});

app.get('/*', (req, res) => {
    const fileName = `${req.url.substring(1)}.html`;
    const filePath = (fileName) => path.join(publicDir, fileName);
    if (fs.existsSync(filePath(fileName))) {
        res.sendFile(filePath(fileName));
    } else {
        res.status(404).sendFile(filePath('404.html'));
    }
});

const server = app.listen(port, () => {
    console.log(`${chalk.greenBright('Server Listening On Port')} ${chalk.greenBright.bold(port)}\n${chalk.magentaBright('Visit:')} ${chalk.blue('http://localhost:' + port)}`);
});

process.on('SIGINT', shutdownGracefully);
process.on('SIGTERM', shutdownGracefully);
process.on('SIGQUIT', shutdownGracefully);

function shutdownGracefully(signal) {
    console.log(chalk.bgRedBright(`Received ${signal}`));
    console.log(chalk.redBright('Shutting Down Server Gracefully...'));
    admin.app().delete();
    server.close();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
}