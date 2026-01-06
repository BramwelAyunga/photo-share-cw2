import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
import api from '../lib/api';
import Comments from '../components/comments/Comments';
import Rating from '../components/ratings/Rating';
import { FaStar } from 'react-icons/fa';

const fetchMediaDetails = async (id) => {
    const { data } = await api.get(`/api/media/${id}`);
    return data;
};

const MediaDetailPage = () => {
    const { id } = useParams();
    const { data: media, error, isLoading } = useQuery({
        queryKey: ['media', id],
        queryFn: () => fetchMediaDetails(id)
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;
    if (!media) return <div>Media not found.</div>;

    

    return (
        <>
            <div className="bg-white dark:bg-black shadow-lg rounded-lg overflow-hidden m-4">
                <img src={media.blob_url} alt={media.title} className="w-full object-cover" style={{ maxHeight: '70vh' }} />
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2">{media.title}</h1>
                    <p className="text-gray-600 mb-4">by <Link to={`/profile/${media.user_id}`} className="hover:underline">{media.creator_name}</Link></p>
                    {media.caption && <p className="text-gray-800 my-4">{media.caption}</p>}
                    {media.location && <p className="text-gray-500 text-sm">Location: {media.location}</p>}
                    
                    <div className="my-4 flex items-center justify-between">
                        <div>
                            <FaStar className="text-yellow-500 text-2xl inline-block" />
                            <span className="ml-2 text-xl">{parseFloat(media.average_rating || 0).toFixed(1)}</span>
                        </div>
                        <Rating mediaId={id} />
                    </div>
                </div>
            </div>

            <div className="m-4">
                <Comments mediaId={id} />
            </div>
        </>
    );
};

export default MediaDetailPage;
