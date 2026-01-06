import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
// import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

// Fetches user profile data (id, name, role)
const fetchUserProfile = async (userId) => {
    const { data } = await api.get(`/api/users/${userId}`);
    return data;
};

// Fetches media uploaded by a specific user
const fetchUserMedia = async (userId) => {
    const { data } = await api.get(`/api/users/${userId}/media`);
    return data;
};

const ProfilePage = () => {
    const { userId } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Query for fetching the profile data of the user whose page is being viewed
    const { data: profileData, error: profileError, isLoading: isProfileLoading } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => fetchUserProfile(userId),
    });

    // Query for fetching the media, but only enable it if the user is a 'creator'
    const { data: media, error: mediaError, isLoading: isMediaLoading } = useQuery({
        queryKey: ['userMedia', userId],
        queryFn: () => fetchUserMedia(userId),
        // This query will only run if profileData exists and the user's role is 'creator'
        enabled: !!profileData && profileData.role === 'creator',
    });

    const isOwnProfile = user && user.id === parseInt(userId, 10);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (isProfileLoading) return <div className="p-4 text-center">Loading Profile...</div>;
    if (profileError) return <div className="p-4 text-center text-red-500">Error loading profile: {profileError.message}</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                    <FaUserCircle className="w-16 h-16 text-gray-400" />
                    <div>
                        <h1 className="text-3xl font-bold">{profileData?.name || 'User'}</h1>
                        <span className="text-sm text-gray-500 capitalize">Role: {profileData?.role}</span>
                    </div>
                </div>
                {isOwnProfile && (
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                        Logout
                    </button>
                )}
            </div>

            {/* Only show the media section if the user is a creator */}
            {profileData?.role === 'creator' && (
                <>
                    <h2 className="text-2xl font-bold mb-4 border-t pt-4">Uploaded Media</h2>
                    {isMediaLoading ? <p>Loading media...</p> :
                        mediaError ? <p className="text-red-500">Could not load media.</p> :
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {media && media.length > 0 ? media.map((item) => (
                                    <Link to={`/media/${item.id}`} key={item.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <img src={item.thumbnail_blob_url || item.blob_url || 'https://via.placeholder.com/200'} alt={item.title} className="w-full h-48 object-cover" />
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                        </div>
                                    </Link>
                                )) : (
                                    <p>This user has not uploaded any media.</p>
                                )}
                            </div>
                    }
                </>
            )}
        </div>
    );
};

export default ProfilePage;
