import SideNav from './SideNav';
import BottomNav from './BottomNav';

const MainLayout = ({ children }) => {
    return (
        <div className="flex justify-center min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
            <div className='hidden md:flex'>
                <SideNav/> {/* SideNav directly in flex container, hidden on small screens */}
            </div>
            <main className="w-full md:max-w-2xl border-x border-gray-200 dark:border-gray-700 pb-12">
                {children}
            </main>
            <footer className="md:hidden fixed bottom-0 w-full">
                <BottomNav />
            </footer>
        </div>
    );
};

export default MainLayout;