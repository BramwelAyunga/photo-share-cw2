const ratingsService = require('../services/ratingsService');

const rateMedia = async (req, res) => {
    try {
        const { media_id } = req.params;
        const { rating } = req.body;
        const user_id = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const savedRating = await ratingsService.rateMedia({
            media_id,
            user_id,
            rating
        });

        res.status(201).json(savedRating);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    rateMedia
};
