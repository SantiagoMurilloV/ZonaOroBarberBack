
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import '../components/styles/Customers.css';
import { environment } from '../environments.js';
import { IconlogoCustomers, IconLogOut, IconWhaterMarkCustomers, ImageBarbers } from './svg/iconos.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';

const Customers = ({ currentUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    fetch(`${environment.apiURL}/api/barbers`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener los barberos');
        }
        return response.json();
      })
      .then((data) => {
        setBarbers(data); // Guardamos los barberos obtenidos
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <BarLoader color="#FFD700" loading={loading} height={4} width={200} />
      </div>
    );
  }

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Cerrando sesión', '', 'success');
        setUser(null);
        navigate('/');
      }
    });
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className={`StartScreen-container-customers ${loading ? 'fade-in' : ''}`}>
      <div>
        <button onClick={reloadPage} className="button-icon-reload">
        <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>
      <IconlogoCustomers />
      <div className="title-container">
        <h1 className="title-text">BARBEROS</h1>
      </div>

      <div className={`bottom-buttons ${loading ? 'fade-in' : ''}`}>
        {barbers.map((barber) => (
          <div className="button-column-customers" key={barber._id}>
            <button className="button-icon">
              <Link to={`/reservations/${barber._id}`} className="button-link">
                <ImageBarbers />
              </Link>
              <span className="profile-text-customers">{barber.first_name}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="instagram-logo-container-customers">
        <button onClick={handleLogout}>
          <IconLogOut />
        </button>
      </div>
      <IconWhaterMarkCustomers />
    </div>
  );
};

export default Customers;
