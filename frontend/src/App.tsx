import './App.css';
import { Routes, Route } from "react-router-dom"
import { BrowserRouter as Router } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import ProfilePage from "./pages/ProfilePage/ProfilePage"
import ChatPage from "./pages/ChatPage"
import GamePage from "./pages/GamePage/GamePage"
import ErrorPage from "./pages/ErrorPage"
import PrivateRoute from './components/private-route';
import UserPage from "./pages/UserPage/UserPage"
import Verify2FA from "./pages/2faVerify/2faVerify"

function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path='/' element={<AuthPage/>} />
        <Route path='/login' element={<AuthPage/>} />
        
        <Route path="/2fa/verification"
          element={
            <PrivateRoute>
              <Verify2FA />
            </PrivateRoute>
        }/>
        <Route path="/myProfile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
        }/>
        <Route path="/Profile/:username"
          element={
            // <PrivateRoute>
            <UserPage />
            // </PrivateRoute>
        }/>
        <Route path="/Chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
        }/>
        <Route path='/Chat/:id'
          element={
            <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }/>
        <Route path="/Game"
          element={
            <PrivateRoute>
              <GamePage />
            </PrivateRoute>
        }/>
        <Route path="/Game/:id_game"
          element={
            // <PrivateRoute>
            <GamePage />
            // </PrivateRoute>
        }/>
        <Route path="/*"
          element={
            <PrivateRoute>
              <ErrorPage />
            </PrivateRoute>
        }/>
      </Routes>
    </Router>
    </div>
  );

}

export default App;
