const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mean-socketchat', (err, db) => {
    if (err){
        throw err;
    }

    // Connect to socket.io
    client.on('connection', () => {
         //creating a collection
        let chat = db.collection('chats');

        // creating function to send status
        sendStatus = (s) => {
            socket.emit('status', s);
        }
    });

    console.log('MongoDB connected');
});