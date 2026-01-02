const { Queue } = require('bullmq');
require('dotenv').config();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const thumbnailQueue = new Queue('thumbnail-generation', { connection });

module.exports = thumbnailQueue;
