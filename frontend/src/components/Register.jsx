import { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('REGISTER SUBMIT');

    if (formData.password !== formData.confirmPassword) {
      setError('Gesli se ne ujemata');
      return;
    }

    const res = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();
    if (!data.success) return setError(data.message);

    alert('Registracija uspešna');
  };

  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Registracija</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="username" placeholder="Uporabniško ime" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input type="password" name="password" placeholder="Geslo" onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Potrdi geslo" onChange={handleChange} />

          <button className="w-full bg-blue-500 text-white py-3 rounded-lg">
            Registriraj se
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-500 hover:underline">
            Že imaš račun? Prijavi se
          </Link>
        </div>
      </div>
    </div>
  );
}
