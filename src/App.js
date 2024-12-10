import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import LoginAdmin from './components/LoginAdmin'
import Customers from './components/Customers';
import BarbersScreen from './components/BarbersScreen'
import BarberList from './components/BarberList'
import Reservations from './components/Reservations';
import Profile from './components/Profile'
import EditReservation from './components/EditReservations'
import Admin from './components/Admin';
import RegisterUsers from './components/RegisterUser';
import Diary from './components/Diary';
import UserList from './components/usersList';
import Finances from './components/Finances';
import ReservationHistory from './components/ReservationHistory';
import QuotaLimits from './components/QuotaLimits'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path= "/root" element = {<LoginAdmin handleLogin={handleLogin}/>}/>
        <Route path="/customers" element={<Customers currentUser={currentUser} />} />
        <Route path="/barber/:id" element={<BarbersScreen currentUser={currentUser}/>}/>
        <Route path='/barberList/:id' element={<BarberList currentUser={currentUser}/>}/>
        <Route path="/reservations/:id" element={<Reservations />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/editReservation/:id" element={<EditReservation />} />
        <Route path="/admin/:id" element={<Admin currentUser={currentUser} />} />
        <Route path="/registerUsers/:id" element={<RegisterUsers />} />
        <Route path="/diary/:id" element={<Diary />} />
        <Route path="/userList/:id" element={<UserList />} />
        <Route path="/finances/:id" element={<Finances />} />
        <Route path="/reservationHistory/:id" element={<ReservationHistory />} />
        <Route path="/quotaLimits/:id" element={<QuotaLimits />} />


      </Routes>
      <ToastContainer />
    </Router>
  );

  function handleLogin(user) {
    setCurrentUser(user);
  }
}

export default App;