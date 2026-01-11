import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Nutrition from './components/Nutrition';
import Forum from './components/Forum';
import NewPost from './components/NewPost';
import TopicDetail from './components/TopicDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />

      {/* Zaščiteno */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      { }
      <Route path="/forum" element={<ProtectedRoute> <Forum/> </ProtectedRoute>}/>
      <Route path="/forum/new" element={<ProtectedRoute> <NewPost/> </ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
      <Route path="/topic/:id" element={<ProtectedRoute> <TopicDetail /> </ProtectedRoute>} />
    </Routes>
  );
}

export default App;
