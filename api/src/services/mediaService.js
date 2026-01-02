const { v4: uuidv4 } = require('uuid');
const mediaRepository = require('../repositories/mediaRepository');
const { uploadBlob, deleteBlob } = require('../helpers/azureBlobStorage');
const thumbnailQueue = require('../queues/thumbnailQueue');

const uploadMedia = async (mediaData, file) => {
    const { userId, title, caption, location, visibility } = mediaData;
    
    // 1. Upload original image to Azure Blob Storage
    const blobName = `${userId}/${uuidv4()}-${file.originalname}`;
    const imageUrl = await uploadBlob(blobName, file.buffer, file.size);

    // 2. Create media record in the database
    const newMedia = {
        creator_id: userId,
        title,
        caption,
        location,
        is_public: visibility === 'public' ? 1 : 0,
        blob_url: imageUrl,
        filename: blobName,
        thumbnail_blob_url: '', // Will be updated by the worker
    };
    const savedMedia = await mediaRepository.createMedia(newMedia);

    // 3. Add job to queue for thumbnail generation
    await thumbnailQueue.add('generate-thumbnail', {
        mediaId: savedMedia.id,
        originalUrl: imageUrl,
        blobName: blobName,
    });

    return savedMedia;
};

const getPublicMedia = async (options) => {
    return await mediaRepository.getPublicMedia(options);
};

const getMediaById = async (id) => {
    return await mediaRepository.getMediaById(id);
};

const updateMedia = async (mediaId, updateData, userId) => {
    const media = await mediaRepository.getMediaById(mediaId);
    if (!media) {
        throw new Error('Media not found');
    }
    if (media.user_id !== userId) {
        throw new Error('User not authorized to update this media');
    }
    return await mediaRepository.updateMedia(mediaId, updateData);
};

const deleteMedia = async (mediaId, userId) => {
    const media = await mediaRepository.getMediaById(mediaId);
    if (!media) {
        // To prevent leaking information, we can silently succeed or throw a generic error.
        // For this case, we'll throw to let the controller know.
        throw new Error('Media not found');
    }
    if (media.user_id !== userId) {
        throw new Error('User not authorized to delete this media');
    }

    // Delete blobs from Azure
    await deleteBlob(media.blob_name);
    // The thumbnail will have a derived name, e.g., 'thumb-...'
    if (media.thumbnail_blob_name) {
        await deleteBlob(media.thumbnail_blob_name);
    }


    // Delete from database
    await mediaRepository.deleteMedia(mediaId);
};

module.exports = {
    uploadMedia,
    getPublicMedia,
    getMediaById,
    updateMedia,
    deleteMedia,
};
