import { useEffect, useState } from "react";
import { Users, GraduationCap, Link2, FileText } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";

import { listUsers } from "@/services/user";
import { listMappings } from "@/services/mapping";

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userRes, mapRes] = await Promise.all([
        listUsers(),
        listMappings(),
      ]);

      const allUsers = userRes.data || [];

      setStudents(allUsers.filter((u) => u.role === "student"));
      setFaculty(allUsers.filter((u) => u.role === "faculty"));
      setMappings(mapRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate stats
  const activeMappings = mappings.length;

  const mappedStudentIds = mappings.map((m) => m.student?._id);
  const unmappedStudents = students.filter((s) => !mappedStudentIds.includes(s._id));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening in your institution.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Total Faculty"
          value={faculty.length}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active Mappings"
          value={activeMappings}
          icon={Link2}
          color="green"
        />
        <StatCard
          title="Pending Mappings"
          value={unmappedStudents.length}
          icon={FileText}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Recent Students */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Students
          </h3>

          <div className="space-y-3">
            {students.slice(-5).reverse().map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.department}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Year {student.year}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Faculty */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Faculty Members
          </h3>

          <div className="space-y-3">
            {faculty.slice(-5).reverse().map((f) => (
              <div
                key={f._id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{f.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {f.department}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                  {f.designation}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
