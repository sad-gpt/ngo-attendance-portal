import { useEffect, useState } from "react";
import api from "../services/api";

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      const res = await api.get("/volunteers");
      setVolunteers(res.data);
    };
    fetchVolunteers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Volunteers</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {volunteers.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No volunteer records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3">{v.name}</td>
                  <td className="px-6 py-3 text-gray-500">{v.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Volunteers;
