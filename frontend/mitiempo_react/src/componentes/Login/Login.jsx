import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../CSS/Login.css"
import fondo from '../../imagenes/fondo.png';

function Login() {
  const [username, setUsername] = useState(''); // Django usa username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        setSuccess('¡Login exitoso!');
        setTimeout(() => {
          navigate('/Usuarios');
        }, 1000);
      } else {
        setError(data.detail || 'Usuario o contraseña incorrecta');
      }
    } catch (err) {
      console.error('Error al hacer login:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div
        className="login-left"
        style={{ backgroundImage: `url(${fondo})` }}
      >
        <h1>Romina Magallanez</h1>
        <p>ESTILISTA</p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>

          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          {/* Mensajes dinámicos */}
          {error && <p className="message error">{error}</p>}
          {success && <p className="message success">{success}</p>}

          <div className="login-links">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
