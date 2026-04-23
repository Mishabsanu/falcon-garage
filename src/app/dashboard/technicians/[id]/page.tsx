"use client";

import { useEffect, useState } from "react";

export default function TechnicianDetail({ params }: { params: Promise<{ id: string }> }) {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      fetch("/api/dashboard/technician-jobs", {
        method: "POST",
        body: JSON.stringify({
          technicianId: id,
        }),
      })
        .then((res) => res.json())
        .then((res) => setJobs(res.data));
    };
    fetchData();
  }, [params]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Technician Jobs</h2>

      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th>Job Card</th>

            <th>Status</th>

            <th>Vehicle</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job._id}>
              <td>{job.jobCardNumber}</td>

              <td>{job.status}</td>

              <td>{job.vehicleId?.number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
