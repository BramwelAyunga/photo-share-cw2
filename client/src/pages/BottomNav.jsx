import { Link } from 'react-router-dom';
import { FaHome, FaUser, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const { user } = useAuth();

    return (
        <nav className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 flex justify-around p-2">
            <Link to="/" className="text-2xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><FaHome /></Link>
            {user ? (
                <Link to={`/profile/${user.id}`} className="text-2xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><FaUser /></Link>
            ) : (
                <Link to="/login" className="text-2xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><FaSignInAlt /></Link>
            )}
        </nav>
    );
};

export default BottomNav;