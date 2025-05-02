"use client";

import { useState } from "react";
import Papa from "papaparse";
import Image from "next/image";

export default function Home() {
  const [clients, setClients] = useState([]);
  const [idSearch, setIdSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [results, setResults] = useState([]);
  const [csvFileName, setCsvFileName] = useState(""); // Nuevo estado para el nombre del archivo
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBirthdate, setSortBirthdate] = useState(null); // null, 'asc', 'desc'

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        // Acepta fechas en m/dd/yyyy, mm/dd/yyyy y yyyy-mm-dd
        const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
        let validRows = [];
        let invalidCount = 0;
        // Filtrar filas vacías (todas las celdas vacías o undefined)
        const dataRows = results.data.filter((row) => {
          return Object.values(row).some(
            (v) => v && v.toString().trim() !== ""
          );
        });
        dataRows.forEach((row) => {
          // Validar campos obligatorios
          if (
            !row.id ||
            !row.nombres ||
            !row.apellidos ||
            !row.ciudad ||
            !row.email
          ) {
            invalidCount++;
            return;
          }
          // Validar formato de fechas si existen
          if (row.fecha_nacimiento && !dateRegex.test(row.fecha_nacimiento)) {
            invalidCount++;
            return;
          }
          if (row.fecha_registro && !dateRegex.test(row.fecha_registro)) {
            invalidCount++;
            return;
          }
          validRows.push(row);
        });
        const response = await fetch("/api/clients", {
          method: "POST",
          body: JSON.stringify(validRows),
        });
        if (response.ok) {
          let msg = `Datos cargados correctamente. Registros válidos: ${validRows.length}`;
          if (invalidCount > 0) {
            msg += ` | Registros descartados: ${invalidCount}`;
          }
          alert(msg);
          setClients(validRows);
        }
      },
    });
  };

  const searchById = async () => {
    if (!/^\d+$/.test(idSearch)) {
      alert("El ID debe ser un número positivo.");
      return;
    }
    const res = await fetch(`/api/clients?id=${idSearch}`);
    const data = await res.json();
    // Si data es null, undefined o un objeto vacío, mostrar sin resultados
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      setResults([]);
    } else {
      setResults([data]);
    }
  };

  const updateResults = (data) => {
    if (data && data.data) {
      setResults(data.data);
      setTotalPages(data.totalPages);
      setTotalResults(data.total);
    } else {
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
    }
  };

  const fetchClients = async (params = "") => {
    let sortParam = "";
    if (sortBirthdate) sortParam = `&sortBirthdate=${sortBirthdate}`;
    const res = await fetch(
      `/api/clients?page=${page}&pageSize=${pageSize}${params}${sortParam}`
    );
    const data = await res.json();
    updateResults(data);
  };

  // Nuevo: listar todos los clientes sin filtros
  const listAllClients = async () => {
    setSortBirthdate(null); // Quitar ordenamiento
    setPage(1);
    await fetchClients("");
  };

  // Modificar toggleSortBirthdate para ordenar solo los resultados actuales
  const toggleSortBirthdate = () => {
    const nextSort = sortBirthdate === "asc" ? "desc" : "asc";
    setSortBirthdate(nextSort);
    const sorted = [...results].sort((a, b) => {
      const dateA = a.fecha_nacimiento
        ? new Date(a.fecha_nacimiento)
        : new Date(0);
      const dateB = b.fecha_nacimiento
        ? new Date(b.fecha_nacimiento)
        : new Date(0);
      return nextSort === "asc" ? dateA - dateB : dateB - dateA;
    });
    setResults(sorted);
  };

  const searchByCity = async () => {
    if (!citySearch.trim()) {
      alert("La ciudad no puede estar vacía.");
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(citySearch.trim())) {
      alert("La ciudad solo puede contener letras y espacios.");
      return;
    }
    await fetchClients(`&city=${encodeURIComponent(citySearch)}`);
  };

  const sortByAge = async (e) => {
    e.preventDefault();
    await fetchClients(`&sort=age`);
  };

  const searchByAgeRange = async () => {
    if ((ageMin && ageMin < 0) || (ageMax && ageMax < 0)) {
      alert("Las edades no pueden ser negativas.");
      return;
    }
    if (ageMin && ageMax && Number(ageMin) > Number(ageMax)) {
      alert("La edad mínima no puede ser mayor que la edad máxima.");
      return;
    }
    const params = [];
    if (ageMin) params.push(`ageMin=${ageMin}`);
    if (ageMax) params.push(`ageMax=${ageMax}`);
    const query = params.length ? `&${params.join("&")}` : "";
    await fetchClients(query);
  };

  const goToPage = async (newPage) => {
    setPage(newPage);
    // Mantener el último filtro aplicado
    if (citySearch)
      await fetchClients(`&city=${encodeURIComponent(citySearch)}`);
    else if (ageMin || ageMax) {
      const params = [];
      if (ageMin) params.push(`ageMin=${ageMin}`);
      if (ageMax) params.push(`ageMax=${ageMax}`);
      const query = params.length ? `&${params.join("&")}` : "";
      await fetchClients(query);
    } else {
      await fetchClients("");
    }
  };

  const playSound = () => {
    const sound = new Audio("/sounds/tralarero-tralala.mp3"); // Asegúrate de colocar el archivo en la carpeta public/sounds
    sound.play();
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-900">
          Gestión de Clientes
        </h1>
        <Image
          src="/images/tralalero-tralala.png"
          alt="Tralalero Tralala"
          width={100}
          height={100}
          className="rounded-md cursor-pointer"
          onClick={playSound} // Evento para reproducir el sonido
        />
      </div>

      <form className="space-y-12 mt-8" onSubmit={(e) => e.preventDefault()}>
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
            Filtra los clientes por ID, Ciudad o Rango de Edad.
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

            <div className="sm:col-span-1">
              <label
                htmlFor="ageMin"
                className="block text-sm font-medium text-gray-900"
              >
                Buscar por Rango de Edad
              </label>
              <div className="mt-2 flex space-x-2">
                <input
                  id="ageMin"
                  type="number"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  className="block w-1/2 py-2 px-3 rounded-md text-sm text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-600"
                  placeholder="Edad mínima"
                />
                <input
                  id="ageMax"
                  type="number"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  className="block w-1/2 py-2 px-3 rounded-md text-sm text-gray-900 bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-600"
                  placeholder="Edad máxima"
                />
              </div>
              <button
                type="button"
                onClick={searchByAgeRange}
                className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={listAllClients}
            className="w-full py-2 px-4 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Listar todos los clientes
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Resultados</h2>
        {results.length === 0 ? (
          <div className="mt-4 text-sm text-gray-500">
            No se encontraron resultados.
          </div>
        ) : (
          <>
            <div className="mb-2 text-sm text-gray-600">
              Mostrando {results.length} de {totalResults} resultados
            </div>
            {/* Tabla de resultados */}
            <table className="w-full divide-y divide-gray-200 border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Nombres
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Apellidos
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer select-none"
                    onClick={toggleSortBirthdate}
                  >
                    Fecha de nacimiento
                    {sortBirthdate === "asc" && <span> ▲</span>}
                    {sortBirthdate === "desc" && <span> ▼</span>}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Fecha de registro
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((c, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 break-words">{c.id}</td>
                    <td className="px-4 py-2 break-words">{c.nombres}</td>
                    <td className="px-4 py-2 break-words">{c.apellidos}</td>
                    <td className="px-4 py-2 break-words">
                      {c.fecha_nacimiento
                        ? new Date(c.fecha_nacimiento).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-4 py-2 break-words">{c.ciudad}</td>
                    <td className="px-4 py-2 break-words">
                      {c.fecha_registro
                        ? new Date(c.fecha_registro).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-4 py-2 break-words">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Controles de paginación */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
