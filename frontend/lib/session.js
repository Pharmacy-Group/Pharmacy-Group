const session = require("express-session");
const MongoStore = require("connect-mongo");

module.exports = (app) => {
  app.use(
    session({
      name: "sessionId",
      secret: process.env.SESSION_SECRET || "secret_key",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 ngày
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );
};
