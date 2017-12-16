const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mean-socketchat', (err, db) => {
    if (err){
        throw err;
    }

    console.log('MongoDB connected');

    // Connect to socket.io
    client.on('connection', (socket) => {
         //creating a collection
        const myDB = db.db('mean-socketchat') // for higher version of mongo!
        let chat = myDB.collection('chats');

        // creating function to send status
        sendStatus = (s) => {
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray( (err, res) => {
            if (err){
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', (data) => {
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if (name == '' || message == ''){
                sendStatus('Please enter a name and a message');
            }
            else {
                // Insert Message
                chat.insert({name: name, message: message}, () =>  {
                    client.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear', (data) => {
            // Remove all chats from collection
            chat.remove({}, () => {
                socket.emit('cleared');
            });
        });

    });

});