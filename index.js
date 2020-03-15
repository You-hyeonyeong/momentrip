const express = require('./config/express');
const {logger} = require('./config/winston');
var schedule = require('node-schedule');
const scheduleModule = require('./modules/scheduleModule')

const port = 3333;
express().listen(port);

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);