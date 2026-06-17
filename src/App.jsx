import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
//import theme from './theme';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from './components/navbar';
import PrivateRoute from './components/private-route';
import Login from './pages/login';
import AdminDashboard from './pages/admin-dashboard';
import UserDashboard from './pages/user-dashboard';
//import Footer from './components/footer';

// Decides what page to load for "/" based on authenticated role
const HomeSelector = () => {
  const { user } = useAuth();
  if (user && user.role === 'admin') {
    return <AdminDashboard />;
  }
  return <UserDashboard />;
};

function App() {
  return (
    <ChakraProvider >
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <HomeSelector />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
         
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
