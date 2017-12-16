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

        // Get chats from mongo collection
        chat.find().limit(100).sort({id:1}).toArray( (err, res) => {
            if (err){
                throw err;
            }

            // Emit the messages
            res.emit('output', res);
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


    console.log('MongoDB connected');
});