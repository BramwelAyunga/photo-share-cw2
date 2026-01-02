import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaSignInAlt } from 'react-icons/fa'; // Removed FaSignOutAlt
import { useAuth } from '../context/AuthContext';

const SideNav = () => {
    const { user } = useAuth(); // Removed logout and navigate as logout is handled on ProfilePage

    return (
        <nav className="w-64 p-4 flex flex-col h-full"> {/* Added h-full for better flex behavior */}
            <div className="space-y-4">
                <Link to="/" className="flex items-center space-x-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md">
                    <FaHome /> <span>Home</span>
                </Link>
                {user ? (
                    <>
                        <Link to={`/profile/${user.id}`} className="flex items-center space-x-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md">
                            <FaUser /> <span>Profile</span>
                        </Link>
                    </>
                ) : (
                    <Link to="/login" className="flex items-center space-x-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md"><FaSignInAlt /> <span>Sign In</span></Link>
                )}
            </div>
        </nav>
    );
};

export default SideNav;