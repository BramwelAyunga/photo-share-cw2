import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MediaUploadPage = () => {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: (formData) => {
            return axios.post('/api/media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        },
        onSuccess: (data) => {
            navigate(`/media/${data.data.id}`);
        },
        onError: (error) => {
            alert(error.response?.data?.message || 'Upload failed');
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!image) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('caption', caption);
        formData.append('location', location);
        formData.append('visibility', visibility);
        formData.append('image', image);

        mutation.mutate(formData);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Upload Media</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Sunset at the beach" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"/>
                </div>
                <div>
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Caption</label>
                    <textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} rows="3" placeholder="A short description of the image" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"></textarea>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Malibu, California" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"/>
                </div>
                <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</label>
                    <select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                    <input type="file" onChange={handleImageChange} accept="image/*" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    {preview && <img src={preview} alt="Preview" className="mt-4 h-48 w-auto"/>}
                </div>
                <button type="submit" disabled={mutation.isPending} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                    {mutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
            </form>
        </div>
    );
};

export default MediaUploadPage;
