import { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  // Inicializacija
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Posodabljanje stanja vsakič, ko uporabnik nekaj vnese v polje
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    // Uporabljamo URL, ki se ujema s backendom (api/v1/auth/register)
    const response = await axios.post('http://localhost:3000/api/v1/auth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    console.log('Uspeh!', response.data);
    alert('Registracija uspešna: ' + response.data.message);
    
  } catch (err) {
    console.error('Napaka pri komunikaciji:', err);
    // Prikaži napako, če strežnik ni dosegljiv ali vrne napako
    setError(err.response?.data?.message || 'Napaka pri povezavi s strežnikom');
  } finally {
    setIsLoading(false);
  }
};

return (
    <div className="min-h-screen bg-gym-black flex items-center justify-center p-4">
      {/* Povečana širina na 'max-w-xl' za boljši izgled na namizju */}
      <div className="bg-gym-gray rounded-3xl shadow-2xl w-full max-w-xl p-8 md:p-12 border border-gym-green/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gym-green">
            {isLogin ? 'Prijava' : 'Registracija'}
          </h1>
          {/* Dodan kratek opis za zapolnitev sirine */}
          <p className="text-gray-400 mt-2">Vnesite podatke za dostop do vašega osebnega fitnes profila.</p>
        </div>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ime</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gym-black border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-gym-green outline-none transition"
                  placeholder="Janez Novak"
                />
              </div>
            </div>
          )}

          {/* Prikaz napake ce obstaja */}
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Elektronski naslov
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gym-black border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-gym-green outline-none transition"
                placeholder="email@primer.si"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Geslo</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gym-black border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-gym-green outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gym-green hover:bg-opacity-90 text-black font-bold py-4 rounded-xl transition duration-200 disabled:opacity-50 mt-4 shadow-lg shadow-gym-green/10"
          >
            {isLoading ? 'Nalaganje ...' : isLogin ? 'Prijavi se' : 'Registriraj se'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ email: '', password: '', confirmPassword: '', name: '' });
            }}
            className="text-gym-green hover:text-white font-medium transition-colors"
          >
            {isLogin ? 'Še nimaš računa? Ustvari ga zdaj' : 'Že imaš račun? Prijavi se tukaj'}
          </button>
        </div>
      </div>
    </div>
  );
}