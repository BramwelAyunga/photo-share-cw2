const mediaService = require('../services/mediaService');

const uploadMedia = async (req, res) => {
    try {
        const { title, caption, location, visibility } = req.body;
        const mediaData = {
            title,
            caption,
            location,
            visibility,
            userId: req.user.id
        };
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Image file is required.' });
        }

        const media = await mediaService.uploadMedia(mediaData, file);
        res.status(201).json(media);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPublicMedia = async (req, res) => {
    try {
        const { page = 1, limit = 10, filter, search } = req.query;
        const media = await mediaService.getPublicMedia({ page, limit, filter, search });

        
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMediaById = async (req, res) => {
    try {
        const media = await mediaService.getMediaById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMedia = async (req, res) => {
    try {
        const media = await mediaService.updateMedia(req.params.id, req.body, req.user.id);
        res.json(media);
    } catch (error) {
        if (error.message === 'Media not found' || error.message === 'User not authorized to update this media') {
            return res.status(404).json({ message: error.message });
        }
        res.status(400).json({ message: error.message });
    }
};

const deleteMedia = async (req, res) => {
    try {
        await mediaService.deleteMedia(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'Media not found' || error.message === 'User not authorized to delete this media') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const getMediaByUserId = async (req, res) => {
    try {
        // This reuses the existing service function, assuming it can handle filtering by user ID
        const media = await mediaService.getPublicMedia({ userId: req.params.userId });
        res.json(media);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadMedia,
    getPublicMedia,
    getMediaById,
    updateMedia,
    deleteMedia,
    getMediaByUserId
};
