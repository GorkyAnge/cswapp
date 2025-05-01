"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function Home() {
  const [clients, setClients] = useState([]);
  const [idSearch, setIdSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [results, setResults] = useState([]);
  const [csvFileName, setCsvFileName] = useState(""); // Nuevo estado para el nombre del archivo

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name); // Establece el nombre del archivo

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const response = await fetch("/api/clients", {
          method: "POST",
          body: JSON.stringify(results.data),
        });
        if (response.ok) {
          alert("Datos cargados correctamente");
          setClients(results.data);
        }
      },
    });
  };

  const searchById = async () => {
    const res = await fetch(`/api/clients?id=${idSearch}`);
    const data = await res.json();
    setResults(data ? [data] : []);
  };

  const searchByCity = async () => {
    const res = await fetch(`/api/clients?city=${citySearch}`);
    const data = await res.json();
    setResults(data);
  };

  const sortByAge = async (e) => {
    e.preventDefault(); // Previene la recarga del formulario

    const res = await fetch(`/api/clients?sort=age`);
    const data = await res.json();
    setResults(data); // Actualiza los resultados
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-semibold text-gray-900">
        Gestión de Clientes
      </h1>

      <form className="space-y-12 mt-8">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Subir Archivo CSV
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sube un archivo CSV con los datos de los clientes.
          </p>

          <div className="mt-6">
            <label
              htmlFor="csv-upload"
              className="block text-sm font-medium text-gray-900"
            >
              Seleccionar archivo
            </label>
            <div className="mt-2">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="block w-full py-2 px-3 rounded-md text-sm text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Mostrar el nombre del archivo y el icono de CSV */}
          {csvFileName && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <svg
                className="w-5 h-5 mr-2 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h3zm11 0a1 1 0 011 1v14a1 1 0 01-1 1h-3a1 1 0 01-1-1V3a1 1 0 011-1h3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{csvFileName}</span>
            </div>
          )}
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-xl font-semibold text-gray-900">Búsqueda</h2>
          <p className="mt-2 text-sm text-gray-600">
            Filtra los clientes por ID o Ciudad.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-0">
            <div className="sm:col-span-1">
              <label
                htmlFor="idSearch"
                className="block text-sm font-medium text-gray-900"
              >
                Buscar por ID
              </label>
              <div className="mt-2">
                <input
                  id="idSearch"
                  type="text"
                  value={idSearch}
                  onChange={(e) => setIdSearch(e.target.value)}
                  className="block w-full py-2 px-3 rounded-md text-sm text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ejemplo: 123"
                />
              </div>
              <button
                type="button"
                onClick={searchById}
                className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Buscar
              </button>
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="citySearch"
                className="block text-sm font-medium text-gray-900"
              >
                Buscar por Ciudad
              </label>
              <div className="mt-2">
                <input
                  id="citySearch"
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="block w-full py-2 px-3 rounded-md text-sm text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ejemplo: Santiago"
                />
              </div>
              <button
                type="button"
                onClick={searchByCity}
                className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={sortByAge}
            className="w-full py-2 px-4 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Ordenar por Edad
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Resultados</h2>
        <ul className="mt-4 space-y-4">
          {results.map((c, i) => (
            <li key={i} className="text-sm text-gray-900">
              {c.id} - {c.name} - {c.city} - {c.age}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
