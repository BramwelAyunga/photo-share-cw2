const ratingsRepository = require('../repositories/ratingsRepository');
const mediaRepository = require('../repositories/mediaRepository');

const rateMedia = async (ratingData) => {
    const { media_id, user_id, rating } = ratingData;

    // Check if media exists
    const media = await mediaRepository.getMediaById(media_id);
    if (!media) {
        throw new Error('Media not found.');
    }

    // Check if user has already rated this media
    const existingRating = await ratingsRepository.findRatingByUserAndMedia(user_id, media_id);

    if (existingRating) {
        // Update existing rating
        return await ratingsRepository.updateRating(existingRating.id, rating);
    } else {
        // Create new rating
        return await ratingsRepository.createRating({ media_id, user_id, rating });
    }
};

module.exports = {
    rateMedia
};
