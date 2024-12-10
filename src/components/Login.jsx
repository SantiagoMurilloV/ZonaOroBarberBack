import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import '../components/styles/Login.css';
import { environment } from '../environments';
import { Iconlogo } from './svg/iconos';
import { IconInsta } from './svg/iconos';
import { IconWhat } from './svg/iconos';
import { IconWhaterMark } from './svg/iconos';

const Login = ({ handleLogin }) => {
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

  const performLogin = () => {
            navigate(`/customers`);
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
            <div className="button-container">
              <button type="button" onClick={performLogin}>
                Agendar Cita
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
              <IconInsta />
            </a>
          </div>
          <a
            href="https://wa.link/o0j8jm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhat />
          </a>
        </div>
      </div>
      <IconWhaterMark />
    </div>
  );
};

export default Login;
