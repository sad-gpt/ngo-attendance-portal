import { useEffect, useState } from "react";
import api from "../services/api";

const Children = () => {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      const res = await api.get("/children");
      setChildren(res.data);
    };
    fetchChildren();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Children</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {children.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No children records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3">{child.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Children;
