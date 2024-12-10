import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';
import '../components/styles/Barbers.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCheck, faRedo, faUser } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../environments';
import { IconlogoCustomers } from './svg/iconos';
import Swal from 'sweetalert2';


const AgendaBarber = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [barber, setBarber] = useState(null);


  useEffect(() => {
    const fetchBarberAndReservations = async () => {
      try {

        const barberResponse = await axios.get(`${environment.apiURL}/api/barbers/${id}`);
        setBarber(barberResponse.data);
        fetchReservations(selectedDate);
      } catch (error) {
        console.error('Error al obtener la información del barbero o reservas:', error);
      }
    };

    fetchBarberAndReservations();
  }, [id]);

  const fetchReservations = async (date) => {
    try {
      const reservationsResponse = await axios.get(
        `${environment.apiURL}/api/reservationsByDay/barber/${id}?day=${date}`
      );
      setReservations(reservationsResponse.data);
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
    }
  };
  const reloadPage = () => {
    window.location.reload();
  };
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchReservations(newDate);
  };
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
        navigate('/root');
      }
    });
  };

  return (
    <div className="agenda-container">
      <div>
        <button onClick={reloadPage} className="button-icon-reload">
          <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>

      <button onClick={handleLogout}>
        <IconlogoCustomers />

      </button>



      <h1>AGENDA</h1>
      <h3>
        {moment(selectedDate).format('dddd').toUpperCase()} ({moment(selectedDate).format('DD MMM YYYY')})
      </h3>


      <div className="agenda-actions">
        <button className="action-button">
          <FontAwesomeIcon icon={faCheck} /> Cupos Disponibles
        </button>
        <button className="action-button">
          <FontAwesomeIcon icon={faUser} /> Asignación de Citas
        </button>
        <div className="date-filter">
          <label htmlFor="date-filter">
            <FontAwesomeIcon icon={faCalendarAlt} /> Filtrar por fecha:
          </label>
          <input
            type="date"
            id="date-filter"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      <div className="reservations-list-slider">
        {reservations.length > 0 ? (
          reservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <p className="reservation-time">{reservation.hours}</p>
              <p className="reservation-name"><strong>Cliente:</strong> {reservation.name_cliente}</p>
              <p className="reservation-phone"><strong>Teléfono:</strong> {reservation.cel_cliente}</p>
            </div>
          ))
        ) : (
          <p className="no-reservations">No hay reservas para la fecha seleccionada.</p>
        )}
      </div>


    </div>
  );
};

export default AgendaBarber;


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import moment from 'moment';
// import 'moment/locale/es';
// import '../components/styles/Barbers.css';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCalendarAlt, faCheck, faRedo, faUser } from '@fortawesome/free-solid-svg-icons';
// import { environment } from '../environments';
// import Swal from 'sweetalert2';

// const AgendaBarber = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [reservations, setReservations] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
//   const [barber, setBarber] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     name_cliente: '',
//     cel_cliente: '',
//     day: '',
//     hours: '',
//   });
//   const [availableHours, setAvailableHours] = useState([]);

//   useEffect(() => {
//     const fetchBarberAndReservations = async () => {
//       try {
//         const barberResponse = await axios.get(`${environment.apiURL}/api/barbers/${id}`);
//         setBarber(barberResponse.data);
//         fetchReservations(selectedDate);
//       } catch (error) {
//         console.error('Error al obtener la información del barbero o reservas:', error);
//       }
//     };

//     fetchBarberAndReservations();
//   }, [id]);

//   const fetchReservations = async (date) => {
//     try {
//       const reservationsResponse = await axios.get(
//         `${environment.apiURL}/api/reservationsByDay/barber/${id}?day=${date}`
//       );
//       const reservedHours = reservationsResponse.data.map((res) => res.hours);
//       calculateAvailableHours(reservedHours);
//     } catch (error) {
//       console.error('Error al obtener las reservas:', error);
//     }
//   };

//   const calculateAvailableHours = (reservedHours) => {
//     const allIntervals = generateHalfHourIntervals('08:00', '22:00');
//     const available = allIntervals.filter((interval) => !reservedHours.includes(interval));
//     setAvailableHours(available);
//   };

//   const generateHalfHourIntervals = (start, end) => {
//     const intervals = [];
//     let current = moment(start, 'HH:mm');
//     const endTime = moment(end, 'HH:mm');
//     while (current < endTime) {
//       const nextInterval = current.clone().add(30, 'minutes');
//       intervals.push(`${current.format('hh:mm A')} - ${nextInterval.format('hh:mm A')}`);
//       current.add(30, 'minutes');
//     }
//     return intervals;
//   };

//   const handleOpenModal = () => {
//     setShowModal(true);
//     setFormData({ ...formData, day: selectedDate }); // Por defecto, asignar la fecha seleccionada actual
//     fetchReservations(selectedDate);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setFormData({ name_cliente: '', cel_cliente: '', day: '', hours: '' });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.name_cliente || !formData.cel_cliente || !formData.day || !formData.hours) {
//       Swal.fire('Error', 'Por favor, completa todos los campos.', 'error');
//       return;
//     }

//     const data = {
//       ...formData,
//       id_barbero: id,
//     };

//     try {
//       await axios.post(`${environment.apiURL}/api/reservations`, data);
//       Swal.fire('Éxito', 'La cita fue agendada exitosamente.', 'success');
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error al agendar la cita:', error);
//       Swal.fire('Error', 'Hubo un problema al agendar la cita.', 'error');
//     }
//   };

//   const handleDateChange = (e) => {
//     const newDate = e.target.value;
//     setSelectedDate(newDate);
//     fetchReservations(newDate);
//   };

//   return (
//     <div className="agenda-container">
//       <div>
//         <button onClick={() => window.location.reload()} className="button-icon-reload">
//           <FontAwesomeIcon icon={faRedo} />
//         </button>
//       </div>

//       <h1>AGENDA</h1>
//       <h3>
//         {moment(selectedDate).format('dddd').toUpperCase()} ({moment(selectedDate).format('DD MMM YYYY')})
//       </h3>

//       <div className="agenda-actions">
//         <button className="action-button">
//           <FontAwesomeIcon icon={faCheck} /> Cupos Disponibles
//         </button>
//         <button className="action-button" onClick={handleOpenModal}>
//           <FontAwesomeIcon icon={faUser} /> Asignación de Citas
//         </button>
//         <div className="date-filter">
//           <label htmlFor="date-filter">
//             <FontAwesomeIcon icon={faCalendarAlt} /> Filtrar por fecha:
//           </label>
//           <input
//             type="date"
//             id="date-filter"
//             value={selectedDate}
//             onChange={handleDateChange}
//           />
//         </div>
//       </div>

//       <div className="reservations-list-slider">
//         {reservations.length > 0 ? (
//           reservations.map((reservation) => (
//             <div key={reservation._id} className="reservation-card">
//               <p className="reservation-time">{reservation.hours}</p>
//               <p className="reservation-name"><strong>Cliente:</strong> {reservation.name_cliente}</p>
//               <p className="reservation-phone"><strong>Teléfono:</strong> {reservation.cel_cliente}</p>
//             </div>
//           ))
//         ) : (
//           <p className="no-reservations">No hay reservas para la fecha seleccionada.</p>
//         )}
//       </div>

//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <h3>Asignar Cita</h3>
//             <form onSubmit={handleSubmit}>
//               <label>
//                 Nombre del Cliente:
//                 <input
//                   type="text"
//                   name="name_cliente"
//                   value={formData.name_cliente}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </label>
//               <label>
//                 Celular:
//                 <input
//                   type="text"
//                   name="cel_cliente"
//                   value={formData.cel_cliente}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </label>
//               <label>
//                 Fecha:
//                 <input
//                   type="date"
//                   name="day"
//                   value={formData.day}
//                   onChange={(e) => {
//                     handleInputChange(e);
//                     fetchReservations(e.target.value);
//                   }}
//                   required
//                 />
//               </label>
//               <label>
//                 Hora Disponible:
//                 <select
//                   name="hours"
//                   value={formData.hours}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">Selecciona una hora</option>
//                   {availableHours.map((hour) => (
//                     <option key={hour} value={hour}>
//                       {hour}
//                     </option>
//                   ))}
//                 </select>
//               </label>
//               <button type="submit" className="submit-button">
//                 Guardar
//               </button>
//               <button type="button" className="cancel-button" onClick={handleCloseModal}>
//                 Cancelar
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AgendaBarber;
