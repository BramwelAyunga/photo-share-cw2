const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite:10000/devstoreaccount1;';
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;
const BASE_BLOB_URL = process.env.AZURE_STORAGE_BASE_URL;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

const setupContainer = async () => {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    await containerClient.createIfNotExists({ access: 'blob' });
    console.log(`Storage container '${CONTAINER_NAME}' is ready.`);
};

const uploadBlob = async (blobName, buffer, size) => {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, size);
    // Return the publicly accessible URL
    return `${BASE_BLOB_URL}/${CONTAINER_NAME}/${blobName}`;
};

const deleteBlob = async (blobName) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
    } catch (error) {
        // It's often okay to ignore "blob not found" errors during deletion
        if (error.statusCode !== 404) {
            console.error(`Error deleting blob ${blobName}:`, error);
            throw error;
        }
    }
};

module.exports = {
    setupContainer,
    uploadBlob,
    deleteBlob,
};