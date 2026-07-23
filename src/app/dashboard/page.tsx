"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, FileText, Trash2, Edit } from "lucide-react";

export default function DashboardPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch the resumes when the page loads
  const fetchResumes = async () => {
    try {
      const { data } = await axios.get("/api/resumes");
      setResumes(data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
      // If unauthorized, redirect to login
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Function to create a new blank resume
  const createResume = async () => {
    try {
      const { data } = await axios.post("/api/resumes", { title: "My New Resume" });
      router.push(`/resume/${data._id}`); // Redirect directly to the editor
    } catch (error) {
      console.error("Failed to create resume", error);
    }
  };

  // Function to delete a resume
  const deleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axios.delete(`/api/resumes/${id}`);
      fetchResumes(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete resume", error);
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
        <button 
          onClick={createResume}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <PlusCircle size={20} />
          Create New
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You haven't created any resumes yet.</p>
          <button onClick={createResume} className="text-indigo-600 font-medium hover:underline">
            Click here to create your first one!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume._id} className="bg-white rounded-lg border shadow-sm p-6 flex flex-col hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4 text-indigo-600">
                <FileText size={32} />
                <h3 className="font-bold text-xl text-gray-900 truncate">{resume.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              
              <div className="mt-auto flex justify-between pt-4 border-t border-gray-100">
                <Link 
                  href={`/resume/${resume._id}`}
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <Edit size={16} /> Edit
                </Link>
                <button 
                  onClick={() => deleteResume(resume._id)}
                  className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}