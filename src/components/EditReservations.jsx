import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import '../components/styles/Diary.css';
import '../../src/components/styles/EditReservations.css';
import { faTrash, faEdit, faBan, faHomeAlt, faCalendarPlus, faCalendarDay, faArrowLeft, faArrowRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import axios from 'axios';
import { environment } from '../environments';
import { IconWhaterMarkEditReservations } from './svg/iconos';



const EditReservations = () => {
  const [userReservations, setUserReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(moment().startOf('week'));
  const [reservationsData, setReservationsData] = useState({});
  const [slotInfo, setSlotInfo] = useState({});
  const { id } = useParams();
  const [icon, setIcon] = useState('')


  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formData, setFormData] = useState({
    reservationId: '',
    date: '',
    hour: '',
  });

  const fetchUserReservations = (id, startDate) => {
    const endDate = moment(startDate).endOf('isoWeek').toDate();
    fetch(`${environment.apiURL}/api/reservationsid/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUserReservations(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar las reservas del usuario:', error);
        setLoading(false);
      });
  };

  const fetchSlotInfo = async () => {
    try {
      const response = await axios.get(`${environment.apiURL}/api/slots`);
      const slots = response.data.reduce((acc, slot) => {
        const slotKey = `${slot.day}-${slot.hour}`;
        acc[slotKey] = slot.slots;
        return acc;
      }, {});
      setSlotInfo(slots);
    } catch (error) {
      console.error('Error fetching slot info:', error);
    }
  };
  const fetchAllReservations = async () => {
    const startOfWeek = moment(selectedDate).startOf('isoWeek').format('YYYY-MM-DD');
    const endOfWeek = moment(selectedDate).endOf('isoWeek').format('YYYY-MM-DD');

    try {
      const response = await fetch(`${environment.apiURL}/api/reservations`, {
        params: { startDate: startOfWeek, endDate: endOfWeek }
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      const data = await response.json();
      const reservationsByDateAndHour = {};
      data.forEach((reservation) => {
        const dateHourKey = `${reservation.day}-${reservation.hour}`;
        reservationsByDateAndHour[dateHourKey] = (reservationsByDateAndHour[dateHourKey] || 0) + 1;
      });

      setReservationsData(reservationsByDateAndHour);
    } catch (error) {
      console.error(error);
      Swal.fire('Error al obtener las reservas', 'Ha ocurrido un error al cargar las reservas del usuario.', 'error');
    }
  };


  useEffect(() => {

    const currentDateInColombia = moment.tz(new Date(), 'America/Bogota');
    setCurrentDate(currentDateInColombia);
    fetchUserReservations(id, currentDateInColombia.startOf('isoWeek').toDate());
    fetchAllReservations()
    fetchSlotInfo()

  }, [id]);



  const handleNextWeek = () => {
    const nextWeek = moment(currentDate).add(1, 'weeks').startOf('isoWeek').toDate();
    setCurrentDate(nextWeek);
    fetchUserReservations(id, nextWeek);
  };

  const updateReservationStatus = (reservationId, Status) => {
    fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Status }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Reserva actualizada', 'La reserva ha sido actualizada con éxito.', 'success');
          fetchUserReservations(id, moment(currentDate).startOf('isoWeek').toDate());
        } else {
          console.error('Error al actualizar el estado de la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al obtener datos actualizados:', error);
      });
  };

  const handleCancelReservation = (reservationId) => {
    Swal.fire({
      title: '¿Está seguro que quieres cancelar la reserva?',
      text: 'No podrá revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, Cancelar Reserva',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        updateReservationStatus(reservationId, 'cancelled');
      }
    });
  };
  const handleDeleteReservation = (reservationId) => {
    Swal.fire({
      title: '¿Está seguro de eliminar esta reserva?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
          method: 'DELETE',
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire('Eliminado', 'La reserva ha sido eliminada.', 'success');
              const updatedReservations = userReservations.filter(reservation => reservation._id !== reservationId);
              setUserReservations(updatedReservations);
            } else {
              Swal.fire('Error', 'No se pudo eliminar la reserva.', 'error');
            }
          });
      }
    });
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const availableHours = [
    { value: '06:00', label: '6:00' },
    { value: '07:00', label: '7:00' },
    { value: '08:00', label: '8:00' },
    { value: '09:00', label: '9:00' },
    { value: '10:00', label: '10:00' },
    { value: '16:00', label: '16:00' },
    { value: '17:00', label: '17:00' },
    { value: '18:00', label: '18:00' },
    { value: '19:00', label: '19:00' },
    { value: '20:00', label: '20:00' },
  ];

  const handleOpenReservationForm = (reservationId, date, hour) => {
    const localDate = moment(date).tz('America/Bogota').toDate();
    setFormData({
      reservationId,
      date: localDate,
      hour: { value: hour, label: hour },
    });
    setShowReservationForm(true);
  };

  const handleCloseReservationForm = () => {
    setShowReservationForm(false);
    setFormData({
      reservationId: '',
      date: '',
      hour: '',
    });
  };

  const checkAvailability = async () => {
    const newHour = formData.hour.value;
    const selectedDateStr = moment(formData.date).format('YYYY-MM-DD');
    const reservationDateTimeKey = `${selectedDateStr}-${newHour}`;

    const currentReservationsCount = reservationsData[reservationDateTimeKey] || 0;

    const dayOfWeek = moment(formData.date).format('dddd');
    const dayKey = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    const slotKey = `${dayKey}-${newHour}`;
    const availableSlots = slotInfo[slotKey];

    return currentReservationsCount < availableSlots;
  };

  const handleSaveReservation = async () => {
    const { reservationId, hour } = formData;
    const isAvailable = await checkAvailability();

    if (!isAvailable) {
      Swal.fire('Error', 'No hay cupos disponibles para la hora seleccionada.', 'error');
      return;
    }

    fetch(`${environment.apiURL}/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hour: hour.value }),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire('Reserva actualizada', 'La reserva ha sido actualizada con éxito.', 'success');
          fetchUserReservations(id, moment(currentDate).startOf('isoWeek').toDate());
          handleCloseReservationForm();
        } else {
          console.error('Error al actualizar la reserva');
        }
      })
      .catch((error) => {
        console.error('Error al realizar la solicitud PUT:', error);
      });
  };

  const handlePreviousWeek = () => {
    const previousWeek = moment(currentDate).subtract(1, 'weeks').startOf('isoWeek').toDate();
    setCurrentDate(previousWeek);
    fetchUserReservations(id, previousWeek);
  };
  const handleCurrentWeek = () => {
    const currentWeek = moment().tz('America/Bogota').startOf('isoWeek');
    setCurrentDate(currentWeek);
    fetchUserReservations(id, currentWeek.toDate());
  };

  const handleNextMonth = () => {
    const nextMonth = moment(currentDate).add(1, 'month').startOf('isoWeek');
    setCurrentDate(nextMonth);
    fetchUserReservations(id, nextMonth.toDate());
  };



  const renderTableHeaders = () => {
    const headers = [
      'Horas',
      ...moment.weekdays().slice(1).map((day, dayIndex) =>
        moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('dddd (DD/MM)')
      ),
    ];

    const headerClasses = [
      'blue',
      'red',
      'black',
      'grey',
      'red',
      'black',
      'grey',
      'blue',
    ];

    return headers.map((header, index) => (
      <th key={index} className={headerClasses[index]}>
        {header}
      </th>
    ));
  };


  const renderTableRows = () => {
    const morningHours = ['06:00', '07:00', '08:00', '09:00', '10:00'];
    const afternoonHours = ['16:00', '17:00', '18:00', '19:00', '20:00'];
    const allHours = [...morningHours, 'separator', ...afternoonHours];

    return allHours.map((hour, hourIndex) => {
      if (hour === 'separator') {
        return (
          <tr key="separator">
            <td colSpan="8" style={{ backgroundColor: 'rgb(92 92 92)', textAlign: 'center', color: 'black' }}>Break</td>
          </tr>
        );
      } else {
        return (
          <tr key={hour}>
            <td className="first-column">{hour}</td>
            {moment.weekdays().slice(1).map((day, dayIndex) => {
              const currentDayStr = moment(currentDate).startOf('isoWeek').add(dayIndex, 'days').format('YYYY-MM-DD');
              const reservationTime = moment(`${currentDayStr} ${hour}`);
              const currentTime = moment();
              const canDelete = reservationTime.diff(currentTime, 'hours') >= 1;

              const reservationForCell = userReservations.find(
                (reservation) => reservation.day === currentDayStr && reservation.hour === hour && reservation.userId === id
              );

              return (
                <td key={dayIndex}>
                  {reservationForCell ? (
                    <div className={`reservation-cell ${reservationForCell.Status === 'cancelled' ? 'cancelled' : ''}`}>
                      <div className="user-name">
                        {reservationForCell.Status === 'cancelled' ? (
                          `Reserva (Cancelada)`
                        ) : (
                          `Reservado`
                        )}
                      </div>
                      {reservationForCell.Status !== 'cancelled' && (
                        <>
                          {canDelete ? (
                            <>
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="delete-icon"
                                onClick={() => handleDeleteReservation(reservationForCell._id)}
                                style={{ color: '#b80f0f', cursor: 'pointer' }}
                              />
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="edit-icon"
                                onClick={() =>
                                  handleOpenReservationForm(
                                    reservationForCell._id,
                                    reservationForCell.day,
                                    reservationForCell.hour
                                  )
                                }
                                style={{ cursor: 'pointer' }}
                              />
                            </>
                          ) : (
                            <FontAwesomeIcon
                              icon={faBan}
                              className="cancel-icon"
                              style={{ color: 'rgb(255 154 112)' }}
                            />
                          )}

                        </>
                      )}
                    </div>
                  ) : (
                    <div className="reservation-cell">☒</div>
                  )}
                </td>
              );
            })}
          </tr>
        );
      }
    });
  };



  return (
    <div className={`Diary-container ${loading ? 'fade-in' : 'fade-out'}`}>
      <div className="diary-header">
        <div className="diary-title">
          <h1>Editar Reservas</h1>
        </div>
        <div className="date-navigation-edit ">
          <button className="nav-button" onClick={handlePreviousWeek}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button className="nav-button" onClick={handleCurrentWeek}><FontAwesomeIcon icon={faCalendarDay} /></button>
          <button className="nav-button" onClick={handleNextWeek}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <button className="nav-button" onClick={handleNextMonth}>
            <FontAwesomeIcon icon={faCalendarPlus} />
          </button>
          <Link to={`/reservations/${id}`} >
            <button className="nav-button" >
              <FontAwesomeIcon icon={faPlus} /> Reservar
            </button>
          </Link>
          <Link to={`/customers/${id}`} >
            <button className="nav-button" >
              <FontAwesomeIcon icon={faHomeAlt} />
            </button>
          </Link>

        </div>

      </div>
      <div className="edit-table">
        <table>
          <thead>
            <tr>{renderTableHeaders()}</tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
        {showReservationForm && (
          <div className="overlay">
            <div className="reservation-form">
              <label>Hora:</label>
              <Select
                options={availableHours}
                value={formData.hour}
                onChange={(selectedOption) => handleChange('hour', selectedOption)}
              />
              < button className="buttom-modal" onClick={handleSaveReservation}>
                Guardar
              </button>
              <button className="buttom-modal" onClick={handleCloseReservationForm}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      <IconWhaterMarkEditReservations/>
    </div>
  );
};

export default EditReservations;