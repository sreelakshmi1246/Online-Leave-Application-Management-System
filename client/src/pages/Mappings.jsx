import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockStudents, mockFaculty, mockMappings } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { Link2, Trash2 } from 'lucide-react';

const Mappings = () => {
  const [mappings, setMappings] = useState(mockMappings);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const unmappedStudents = mockStudents.filter(
    (s) => !mappings.some((m) => m.studentId === s.id)
  );

  const handleCreateMapping = () => {
    if (!selectedStudent || !selectedFaculty) {
      toast({
        title: 'Error',
        description: 'Please select both student and faculty',
        variant: 'destructive',
      });
      return;
    }

    const newMapping = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      facultyId: selectedFaculty,
      assignedDate: new Date().toISOString().split('T')[0],
    };

    setMappings([...mappings, newMapping]);
    setSelectedStudent('');
    setSelectedFaculty('');
    toast({ title: 'Mapping created successfully' });
  };

  const handleDeleteMapping = (mappingId) => {
    setMappings(mappings.filter((m) => m.id !== mappingId));
    toast({ title: 'Mapping deleted successfully' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Faculty-Student Mappings</h2>
        <p className="text-muted-foreground mt-2">
          Assign faculty advisors to students
        </p>
      </div>

      {/* Create Mapping */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Create New Mapping
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {unmappedStudents.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} - {student.enrollmentNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger>
              <SelectValue placeholder="Select Faculty" />
            </SelectTrigger>
            <SelectContent>
              {mockFaculty.map((faculty) => (
                <SelectItem key={faculty.id} value={faculty.id}>
                  {faculty.name} - {faculty.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleCreateMapping} className="gap-2">
            <Link2 className="w-4 h-4" />
            Create Mapping
          </Button>
        </div>
      </Card>

      {/* Existing Mappings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Existing Mappings ({mappings.length})
        </h3>
        <div className="space-y-3">
          {mappings.map((mapping) => {
            const student = mockStudents.find((s) => s.id === mapping.studentId);
            const faculty = mockFaculty.find((f) => f.id === mapping.facultyId);

            return (
              <div
                key={mapping.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between flex-1 gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {student?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student?.enrollmentNumber} • {student?.department}
                        </p>
                      </div>
                      <div className="hidden md:block text-muted-foreground">→</div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {faculty?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {faculty?.designation} • {faculty?.department}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(mapping.assignedDate).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteMapping(mapping.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
          {mappings.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No mappings found. Create your first mapping above.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Mappings;
