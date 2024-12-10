import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import '../components/styles/Login.css';
import { environment } from '../environments';
import { Iconlogo } from './svg/iconos';
import { IconOverButton } from './svg/iconos';
import { IconInstaAdmin } from './svg/iconos';
import { IconWhatAdmin } from './svg/iconos';
import { IconWhaterMark } from './svg/iconos';

const LoginAdmin = ({ handleLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoaded, setFormLoaded] = useState(false);
  const [isReadyForInstall, setIsReadyForInstall] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
      setFormLoaded(true);
    }, 800);

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      console.log("👍", "beforeinstallprompt", event);
      window.deferredPrompt = event;
      setIsReadyForInstall(true);
    });

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <BarLoader color="#FFD700" loading={loading} height={4} width={200} />
      </div>
    );
  }

  async function downloadApp() {
    console.log("👍", "butInstall-clicked");
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      console.log("oops, no prompt event guardado en window");
      return;
    }
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    console.log("👍", "userChoice", result);
    window.deferredPrompt = null;
    setIsReadyForInstall(false);
  }

  const performLogin = async () => {
    try {

      const barbersResponse = await fetch(`${environment.apiURL}/api/barbers`);
      if (!barbersResponse.ok) {
        throw new Error('Error al obtener la información de los barberos');
      }
      const barbers = await barbersResponse.json();
  
      const barber = barbers.find(
        (barberData) => barberData.phone_number === phone && barberData.barber_idcart === password
      );
  
      if (barber) {
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          text: `¡Bienvenido, ${barber.first_name}!`,
        });
        localStorage.setItem('user', JSON.stringify(barber));
        handleLogin(barber);
        navigate(`/barber/${barber._id}`);
        return;
      }
  
      const adminsResponse = await fetch(`${environment.apiURL}/api/admin`);
      if (!adminsResponse.ok) {
        throw new Error('Error al obtener la información de los administradores');
      }
      const admins = await adminsResponse.json();
  
      const admin = admins.find(
        (adminData) => adminData.phone_number === phone && adminData.admin_idcart === password
      );
  
      if (admin) {
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          text: `¡Bienvenido, ${admin.first_name}!`,
        });
        localStorage.setItem('user', JSON.stringify(admin));
        handleLogin(admin);
        navigate(`/admin/${admin._id}`);
        return;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text: 'Las credenciales son incorrectas. Por favor, inténtalo de nuevo.',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    }
  };
  

  return (
    <div className="Login">
      <div className="center-content">
        <div className='App'>
          <header>
            {isReadyForInstall && <button onClick={downloadApp}>Descargar</button>}
          </header>
        </div>
        <Iconlogo />
        {formLoaded && (
          <>
            <div className="user">
              <h1>Usuario</h1>
              <input
                className="user-input"
                placeholder="Número de celular"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="user">
              <h1>Contraseña</h1>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="button-container">
              <button type="button" onClick={performLogin}>
                Iniciar
              </button>
            </div>
          </>
        )}
        <div className="instagram-logo-container">
          <div>
            <a
              href="https://www.instagram.com/zo_barberia/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconInstaAdmin />
            </a>
          </div>
          <a
            href="https://wa.link/o0j8jm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatAdmin />
          </a>
        </div>
      </div>
      <IconWhaterMark />
    </div>
  );
};

export default LoginAdmin;
