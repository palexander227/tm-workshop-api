const express = require('express')
const passport = require('passport')
const http = require('http')


require('dotenv').config();
const app = express()
app.use(passport.initialize())
require('./config/passport')(passport)

const PORT = process.env.PORT || 12000;

async function onServerStart() {
    console.log(`Listening at port ${PORT}`);

    // Test DB
    const db = require('./config/database');
    db.authenticate()
        .then(() => console.log('Database connected...'))
        .catch(err => console.log('DB Error: ' + err))
}

function main() {
    app.use(require('cors')())
    app.use(express.json())
    app.use(require('skipper')());
    const server = http.createServer(app)
    server.listen(PORT, onServerStart);
    const socketio = require('socket.io');
    const io = socketio(server);
    const socketEvents = require('./sockets');
    socketEvents(io);

    // open routes
    app.get('/', (req, res) => { res.send('Server is running') })

    // partially protected routes
    app.use('/user', require('./routes/user'))

    // protected routes
    app.use(passport.authenticate('jwt', { session: false }))
    app.use('/workspace', require('./routes/workspace'))
    app.use('/posts', require('./routes/post'))
    app.use('/comments', require('./routes/comment'))
    app.use('/chatroom', require('./routes/chatroom'))
}

main();







