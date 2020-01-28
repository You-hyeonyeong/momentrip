const express = require('./config/express');
const {logger} = require('./config/winston');
var schedule = require('node-schedule');
const scheduleModule = require('./modules/scheduleModule')

const port = 3131;
express().listen(port);
          
schedule.scheduleJob('0 * * * *', function () {
    scheduleModule.batteryDeduction();
    console.log('1시간마다 돌아가는 스케줄러');
})

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);