import { Users, GraduationCap, Link2, FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { mockStudents, mockFaculty, mockMappings } from '@/data/mockData';
import { Card } from '@/components/ui/card';

const Dashboard = () => {
  const mappedStudents = mockStudents.filter((s) => s.facultyAdvisorId).length;
  const unmappedStudents = mockStudents.length - mappedStudents;

  return (
    <div className="space-y-6">
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
          value={mockStudents.length}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Total Faculty"
          value={mockFaculty.length}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active Mappings"
          value={mockMappings.length}
          icon={Link2}
          color="green"
        />
        <StatCard
          title="Pending Mappings"
          value={unmappedStudents}
          icon={FileText}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Students
          </h3>
          <div className="space-y-3">
            {mockStudents.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.department}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Year {student.year}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Faculty Members
          </h3>
          <div className="space-y-3">
            {mockFaculty.map((faculty) => (
              <div
                key={faculty.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{faculty.name}</p>
                  <p className="text-sm text-muted-foreground">{faculty.department}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                  {faculty.designation}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
//dashboard 
export default Dashboard;
