import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">PhotoShare</Link>
                <div className="flex items-center space-x-4">
                    <Link to="/" className="hover:text-gray-300">Home</Link>
                    {user ? (
                        <>
                            {user.role === 'creator' && (
                                <Link to="/upload" className="hover:text-gray-300">Upload</Link>
                            )}
                            <Link to={`/profile/${user.id}`} className="hover:text-gray-300">Profile</Link>
                            <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-gray-300">Login</Link>
                            <Link to="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
