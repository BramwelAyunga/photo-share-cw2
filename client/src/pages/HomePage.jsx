import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaRegComment, FaStar, FaUserCircle, FaImage, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import React, { useState, useRef, useEffect } from 'react';

const fetchMedia = async ({ pageParam = 1, searchTerm }) => {
    const limit = 1;
    const url = searchTerm
        ? `/api/media/search?q=${searchTerm}&page=${pageParam}&limit=${limit}`
        : `/api/media?page=${pageParam}&limit=${limit}`;
    const { data } = await axios.get(url);
    return { data, nextPage: data.length === limit ? pageParam + 1 : undefined };
};

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const loadMoreRef = useRef(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        error,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['publicMedia', searchTerm],
        queryFn: ({ pageParam }) => fetchMedia({ pageParam, searchTerm }),
        // Add a check to ensure lastPage is defined before accessing nextPage
        getNextPageParam: (lastPage) => {
            // lastPage will be the object returned from fetchMedia
            return lastPage?.nextPage;
        },
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            }, { threshold: 1.0 }
        );
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (error) return <div className="p-4">An error occurred: {error.message}</div>;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // The query will refetch automatically due to the change in `searchTerm` which is in the queryKey.
    };

    return (
        <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">PhotoShare</h1>
                    <FaSearch
                        className="text-xl cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                        onClick={() => setIsSearchVisible(!isSearchVisible)}
                    />
                </div>
            </div>

            {isSearchVisible && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                        <input
                            type="text"
                            placeholder="Search by creator, title, or caption..."
                            className="flex-1 p-2 border rounded-md mr-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            Search
                        </button>
                    </form>
                </div>
            )}

            {/* "Create Post" UI */}
            {user && user.role == 'creator' && ( // Only show if user is logged in AND is a creator
                <div className="p-4 border-b border-gray-200 dark:border-gray-700" onClick={() => navigate('/upload')}>
                    <div className="flex items-start space-x-4">
                        <FaUserCircle className="w-10 h-10 text-gray-400" />
                        <div className="flex-1">
                            <div className="w-full bg-transparent text-lg text-gray-500 cursor-pointer" >
                                Caption
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <FaImage className="text-blue-500 text-xl cursor-pointer hover:text-blue-400" />
                                <button disabled className="px-4 py-1.5 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 disabled:bg-blue-300">
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="p-4 text-center">Loading feed...</div>
            ) : data && data.pages.some(page => page.data.length > 0) ? (
                <div>
                    {data.pages.map((page, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                            {page.data.map((item) => (
                                <div key={item.id} className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <Link to={`/profile/${item.creator_id}`} className="flex items-center space-x-2 font-bold hover:underline text-gray-800 dark:text-gray-200">
                                            <FaUserCircle className="w-6 h-6 text-gray-400" />
                                            <span>{item.creator_name}</span>
                                        </Link>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <Link to={`/media/${item.id}`}>
                                        <p className="my-1">{item.title}</p>
                                        <img src={item.thumbnail_blob_url || item.blob_url} alt={item.title} className="mt-2 rounded-2xl border border-gray-200 dark:border-gray-700 w-full object-cover" />
                                        <div className="flex items-center text-gray-500 dark:text-gray-400 space-x-8 mt-3">
                                            <div className="flex items-center space-x-2 hover:text-blue-500"><FaRegComment /> <span>{item.comment_count || 0}</span></div>
                                            <div className="flex items-center space-x-2 hover:text-yellow-500"><FaStar /> <span>{parseFloat(item.average_rating || 0).toFixed(1)}</span></div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                    <div ref={loadMoreRef} className="p-4 text-center">
                        {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Scroll to load more' : 'Nothing more to load.'}
                    </div>
                </div>
            ) : (
                <div className="text-center p-10">
                    <p className="text-gray-500 dark:text-gray-400">{searchTerm ? 'No results found.' : 'The gallery is empty.'}</p>
                </div>
            )}
        </>
    );
};

export default HomePage;
