import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
//import axios from 'axios';
import api from '../../lib/api';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';


const fetchComments = async (mediaId) => {
    const { data } = await api.get(`/api/media/${mediaId}/comments`);
    return data;
};

const Comments = ({ mediaId }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const queryClient = useQueryClient();

    const { data: comments, error, isLoading } = useQuery({
        queryKey: ['comments', mediaId],
        queryFn: () => fetchComments(mediaId)
    });

    const mutation = useMutation({
        mutationFn: (newComment) => {
            return api.post(`/api/media/${mediaId}/comments`, newComment);
        },
        onSuccess: () => {
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['comments', mediaId] });
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Failed to post comment.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            alert('You must be logged in to comment.');
            return;
        }
        mutation.mutate({ comment });
    };

    if (isLoading) return <div>Loading comments...</div>;
    if (error) return <div>Error loading comments.</div>;

    const renderComment = (c) => (
        <div key={c.id} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-3">
            <p className="font-semibold dark:text-gray-200">{c.name}</p>
            <p className="text-gray-700 dark:text-gray-300">{c.text}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</p>
            {/* Reply form could be added here */}
            {c.replies && c.replies.length > 0 && (
                <div className="ml-6 mt-3 border-l-2 border-gray-300 dark:border-gray-700 pl-3">
                    {c.replies.map(renderComment)}
                </div>
            )}
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Comments</h2>
            {user && (
                <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        rows="3"
                        required
                    ></textarea>
                    <button type="submit" disabled={mutation.isPending} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                        {mutation.isPending ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            )}
            <div>
                {comments.map(renderComment)}
            </div>
        </div>
    );
};

export default Comments;
