const express = require("express")
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const app = express()
const path = require('path')
const mustacheExpress = require("mustache-express")
const VIEWS_PATH = path.join(__dirname, '/views')
const singlyRouter = require('./routes/singly')
const session = require('express-session')
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const config = require("./config");
const mediasoup = require("mediasoup");
const port = config.server.port;


const indexRouter = require('./routes');
const usersRouter = require('./routes/users');

app.engine("mustache", mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))

app.set("views", VIEWS_PATH)
app.set("view engine", "mustache")

app.use(session({
  secret: 'nakatatlf',
  resave: true,
  saveUninitialized: false
}))

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))

// app.use("/css", express.static(__dirname + '/css'))
app.use("/", singlyRouter);
app.use(express.static(path.join(__dirname, "public")));

//app.use('/', indexRouter);
app.use("/users", usersRouter);
const checkout = require("./routes/checkout");
app.use("/checkout", checkout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


// VIDEO CONFERENCING PORTION

// Map of Room instances indexed by roomId.
const rooms = new Map();

// MediaSoup server
const mediaServer = mediasoup.Server({
  numWorkers: null, // Use as many CPUs as available.
  logLevel: config.mediasoup.logLevel,
  logTags: config.mediasoup.logTags,
  rtcIPv4: config.mediasoup.rtcIPv4,
  rtcIPv6: config.mediasoup.rtcIPv6,
  rtcAnnouncedIPv4: config.mediasoup.rtcAnnouncedIPv4,
  rtcAnnouncedIPv6: config.mediasoup.rtcAnnouncedIPv6,
  rtcMinPort: config.mediasoup.rtcMinPort,
  rtcMaxPort: config.mediasoup.rtcMaxPort
});

// Handle socket connection and its messages
io.on("connection", socket => {
  console.log("New socket connection:", socket.handshake.query);

  // Used for mediaSoup room
  let room = null;
  // Used for mediaSoup peer
  let mediaPeer = null;
  const { roomId, peerName } = socket.handshake.query;

  if (rooms.has(roomId)) {
    room = rooms.get(roomId);
  } else {
    room = mediaServer.Room(config.mediasoup.mediaCodecs);
    rooms.set(roomId, room);
    room.on("close", () => {
      rooms.delete(roomId);
    });
  }

  socket.on("mediasoup-request", (request, cb) => {
    switch (request.method) {
      case "queryRoom":
        room
          .receiveRequest(request)
          .then(response => cb(null, response))
          .catch(error => cb(error.toString()));
        break;

      case "join":
        room
          .receiveRequest(request)
          .then(response => {
            // Get the newly created mediasoup Peer
            mediaPeer = room.getPeerByName(peerName);

            handleMediaPeer(mediaPeer);

            // Send response back
            cb(null, response);
          })
          .catch(error => cb(error.toString()));
        break;

      default:
        if (mediaPeer) {
          mediaPeer
            .receiveRequest(request)
            .then(response => cb(null, response))
            .catch(error => cb(error.toString()));
        }
    }
  });

  socket.on("mediasoup-notification", notification => {
    console.debug("Got notification from client peer", notification);

    // NOTE: mediasoup-client just sends notifications with target 'peer'
    if (!mediaPeer) {
      console.error("Cannot handle mediaSoup notification, no mediaSoup Peer");
      return;
    }

    mediaPeer.receiveNotification(notification);
  });

  // Invokes when connection lost on a client side
  socket.on("disconnect", () => {
    if (mediaPeer) {
      mediaPeer.close();
    }
  });

  /**
   * Handles all mediaPeer events
   *
   * @param mediaPeer
   */
  const handleMediaPeer = mediaPeer => {
    mediaPeer.on("notify", notification => {
      console.log("New notification for mediaPeer received:", notification);
      socket.emit("mediasoup-notification", notification);
    });

    mediaPeer.on("newtransport", transport => {
      console.log("New mediaPeer transport:", transport.direction);
      transport.on("close", originator => {
        console.log("Transport closed from originator:", originator);
      });
    });

    mediaPeer.on("newproducer", producer => {
      console.log("New mediaPeer producer:", producer.kind);
      producer.on("close", originator => {
        console.log("Producer closed from originator:", originator);
      });
    });

    mediaPeer.on("newconsumer", consumer => {
      console.log("New mediaPeer consumer:", consumer.kind);
      consumer.on("close", originator => {
        console.log("Consumer closed from originator", originator);
      });
    });

    // Also handle already existing Consumers.
    mediaPeer.consumers.forEach(consumer => {
      console.log("mediaPeer existing consumer:", consumer.kind);
      consumer.on("close", originator => {
        console.log("Existing consumer closed from originator", originator);
      });
    });
  };
});

// OVERALL FRONTEND OPERATIONS

app.listen(3000, () => {
  console.log("Hey the server is running...");
});

// OVERALL BACKEND OPERATIONS

http.listen(8080, () => {
  console.log(`MediaSoup server is listening on port ${port}!`);
});

module.exports = app;
