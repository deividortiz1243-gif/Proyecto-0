
import { useEffect, useState } from 'react';
import { obtenerSitios } from './services/sitiosService';

function App() {
  const [sitios, setSitios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarSitios = async () => {
      try {
        const datos = await obtenerSitios();
        setSitios(datos);
      } catch (error) {
        console.error('Error al cargar sitios:', error);
        setError('No fue posible cargar los sitios turísticos.');
      } finally {
        setCargando(false);
      }
    };

    cargarSitios();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <header className="mx-auto mb-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-emerald-800">
          TurisPlaY
        </h1>
        <p className="mt-2 text-slate-600">
          Descubre los sitios turísticos del Huila
        </p>
      </header>

      <section className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">
          Sitios turísticos
        </h2>

        {cargando && <p>Cargando sitios turísticos...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!cargando && !error && sitios.length === 0 && (
          <p>No hay sitios turísticos registrados.</p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sitios.map((sitio) => (
            <article
              key={sitio._id}
              className="overflow-hidden rounded-xl bg-white shadow-md"
            >
              {sitio.imagen && (
                <img
                  src={sitio.imagen}
                  alt={sitio.nombre}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-5">
                <h3 className="text-xl font-bold text-emerald-800">
                  {sitio.nombre}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {sitio.categoria}
                </p>

                <p className="mt-3 text-slate-700">
                  {sitio.descripcion}
                </p>

                <p className="mt-3 text-sm text-slate-600">
                  Ubicación: {sitio.ubicacion}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
