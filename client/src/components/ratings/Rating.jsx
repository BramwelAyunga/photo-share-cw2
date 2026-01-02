import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Rating = ({ mediaId }) => {
    const [currentRating, setCurrentRating] = useState(0);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (rating) => {
            return axios.post(`/api/media/${mediaId}/ratings`, { rating });
        },
        onSuccess: () => {
            // Invalidate and refetch the media details to show the new average rating
            queryClient.invalidateQueries({ queryKey: ['media', mediaId] });
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Failed to submit rating.');
        }
    });

    const handleRating = (rate) => {
        if (!user) {
            alert('You must be logged in to rate.');
            return;
        }
        setCurrentRating(rate);
        mutation.mutate(rate);
    };

    return (
        <div>
            <h3 className="font-bold mb-2">Your Rating</h3>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setCurrentRating(star)}
                        onMouseLeave={() => setCurrentRating(0)} // Reset on leave, or keep the submitted rating
                        className={`text-2xl ${currentRating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                        ⭐
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Rating;
