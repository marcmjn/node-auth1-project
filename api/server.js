const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
console.log(typeof KnexSessionStore);  // Should log 'function'
const knex = require('../data/db-config');
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');

const server = express();

server.use(session({
  name: 'chocolatechip',
  secret: 'shh',
  saveUninitialized: false,
  resave: false,
  store: new KnexSessionStore({
    knex,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 10, // delete expired sessions every 10 minutes
  }),
  cookie: {
    maxAge: 1000 * 60 * 10, // 10 minutes
    secure: false, // set to true if your site is served over HTTPS
    httpOnly: true,
  },
}));

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use('/api/users', usersRouter);
server.use('/api/auth', authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
