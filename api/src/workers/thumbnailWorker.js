const { Worker } = require('bullmq');
const sharp = require('sharp');
const axios = require('axios');
const { uploadBlob } = require('../helpers/azureBlobStorage');
const mediaRepository = require('../repositories/mediaRepository');
require('dotenv').config();

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined
};


const worker = new Worker('thumbnail-generation', async (job) => {
    const { mediaId, originalUrl, blobName } = job.data;
    console.log(`Processing thumbnail for mediaId: ${mediaId}`);

    try {
        // 1. Download image from URL
        const response = await axios({
            url: originalUrl,
            responseType: 'arraybuffer'
        });
        const buffer = Buffer.from(response.data, 'binary');

        // 2. Resize image with Sharp
        const thumbnailBuffer = await sharp(buffer)
            .resize(200, 200, { fit: 'cover' })
            .toBuffer();

        // 3. Upload thumbnail to Azure Blob Storage
        const thumbnailBlobName = `thumb-${blobName}`;
        const thumbnailUrl = await uploadBlob(
            thumbnailBlobName,
            thumbnailBuffer,
            thumbnailBuffer.length
        );

        // 4. Update media record with thumbnail URL
        await mediaRepository.updateMedia(mediaId, {
            thumbnail_url: thumbnailUrl,
            thumbnail_blob_name: thumbnailBlobName
        });

        console.log(`Successfully generated thumbnail for mediaId: ${mediaId}`);
    } catch (error) {
        console.error(`Failed to generate thumbnail for mediaId: ${mediaId}`, error);
        // The job will be retried automatically based on queue settings
        throw error;
    }
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

console.log('Thumbnail worker started...');

module.exports = worker;
