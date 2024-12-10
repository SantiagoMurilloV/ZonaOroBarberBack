  import React, { useEffect, useState } from 'react';
  import Swal from 'sweetalert2';
  import { Link, useNavigate, useParams } from 'react-router-dom';
  import '../components/styles/Admin.css';
  import { BarLoader } from 'react-spinners';
  import { environment } from '../environments.js';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faUserPlus, faBook, faCalendarAlt, faSignOutAlt, faStore, faUserFriends } from '@fortawesome/free-solid-svg-icons';
  import { IconHeaderAdmin, IconInstaCustomers, IconWhatCustommers, IconWhaterMarkAdmin, ImageBarbers } from './svg/iconos.js';

  const Admin = ({ currentUser }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(currentUser);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [formLoaded, setFormLoaded] = useState(false);

    useEffect(() => {

      const timer = setTimeout(() => {
        setLoading(false);
        setFormLoaded(true);
      }, 800);

      return () => clearTimeout(timer);
    }, [id]);

    const handleLogout = () => {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Cerrando sesión', '', 'success');
          setUser(null);
          navigate('/root');
        }
      });
    };

    const handleReserveClasses = () => {
      if (user) {
        navigate(`/registerUsers/${user._id}`);
      } else {
        Swal.fire({
          title: 'Usuario no activo',
          text: 'Debes hacer efectivo el pago para poder reservar clases.',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
      }
    };

    if (loading) {
      return (
        <div className="loading-screen">
          <BarLoader color="#FFD700" loading={loading} height={4} width={200} />
        </div>
      );
    }

    return (
      <div className={`StartScreen-container ${loading ? 'fade-in' : 'fade-out'}`}>
        <div className={`button-logout ${loading ? 'fade-in' : 'fade-out'}`}>
        </div>

        <div className={`bottom-buttons ${loading ? 'fade-in' : 'fade-out'}`}>
          <div className="button-column-admin">
          </div>
          <div className="button-column-admin">
          </div>
          <div className="button-column-admin">
            <button className="button-icon">
              <Link to={`/barberList/${id}`} className="button-link">
              <ImageBarbers />
              </Link>
              <span className="profile-text">Barberos</span>

            </button>
          </div>
          <div className="button-column-admin">
            <button className="button-icon">
              <Link to={`/diary/${id}`} className="button-link">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </Link>
                <span className="profile-text">Agenda</span>

            </button>
          </div>
          <div className="button-column-admin">
            <button className="button-icon">
              <Link to={`/userList/${id}`} className="button-link">
                <FontAwesomeIcon icon={faUserFriends} />
              </Link>

                <span className="profile-text">Clientes</span>

            </button>
          </div>
          <div className="button-column-admin">
            <button className="button-icon" onClick={handleLogout}>
              <div className="button-link">
                <FontAwesomeIcon className="button-icon-image" icon={faSignOutAlt} />
              </div>
              <span className="profile-text">Salir</span>
            </button>
          </div>
        </div>

        <div className={`header-admin ${loading ? 'fade-in' : 'fade-out'}`}>
        </div>
        <div className={`instagram-logo-container ${loading ? 'fade-in' : 'fade-out'}`}>
          <div>
          <a
              href="https://www.instagram.com/zo_barberia/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconInstaCustomers />
            </a>
          </div>
          <a
            href="https://wa.link/o0j8jm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatCustommers />
          </a>
        </div>
        <IconWhaterMarkAdmin />
      </div>
    );
  };

  export default Admin;
