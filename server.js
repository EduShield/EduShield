import fs from "fs";
import path from 'path';
import cors from 'cors';
import chalk from 'chalk';
import dotenv from 'dotenv';
import express from 'express';
import admin from 'firebase-admin';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';
import firebaseServiceAccount from './firebaseServiceAccountKey.json' assert {type: 'json'};

dotenv.config();

const server = express();
const port = process.env?.PORT || 3000;
const env = process.env?.ENV?.toLocaleLowerCase();
const gcpProjectId = firebaseServiceAccount.project_id;
const rtdbRegion = process.env?.RTDB_REGION?.toLocaleLowerCase();

if (rtdbRegion === 'asia-southeast1' || rtdbRegion === 'europe-west1') {
    var rtdbUrl = `https://${gcpProjectId}-default-rtdb.${rtdbRegion}.firebasedatabase.app`;
} else if (rtdbRegion === 'us-central1') {
    var rtdbUrl = `https://${gcpProjectId}.firebaseio.com`;
}

admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
    storageBucket: `${gcpProjectId}.appspot.com`,
    databaseURL: rtdbUrl
});

const auth = admin.auth();
const fsdb = admin.firestore();
const rtdb = admin.database();
const storage = admin.storage().bucket();

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

server.use(express.json());
server.use(express.static('public'));

// Done Client Side
// server.get('/api/data', (req, res) => {
//     res.send('Get Student Data');
// });
// server.post('/api/data', (req, res) => {
//     res.send('Post Student Data');
// });
// server.delete('/api/data', (req, res) => {
//     res.send('Delete Student Data');
// });

server.post('/api/visualize', (req, res) => {
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

server.post('/api/ai', (req, res) => {
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

process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);
process.on('SIGQUIT', signalHandler);

function signalHandler(signal) {
    console.log(chalk.redBright(`Received ${signal}`));
    console.log(chalk.redBright('Shutting Down Server'));
    admin.app().delete();
    process.exit();
}