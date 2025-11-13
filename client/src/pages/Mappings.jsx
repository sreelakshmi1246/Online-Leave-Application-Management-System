import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Link2, Trash2 } from 'lucide-react';
import { assignMapping, listMappings, deleteMapping } from '@/services/mapping';
import { listUsers } from '@/services/user';

const Mappings = () => {
  const [mappings, setMappings] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  // Fetch all users and mappings when page loads
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, mapRes] = await Promise.all([listUsers(), listMappings()]);

      const allUsers = userRes.data || [];
      setStudents(allUsers.filter((u) => u.role === 'student'));
      setFaculty(allUsers.filter((u) => u.role === 'faculty'));
      setMappings(mapRes.data || []);
    } catch (err) {
      toast({ title: 'Error loading data', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateMapping = async () => {
    if (!selectedStudent || !selectedFaculty) {
      toast({
        title: 'Error',
        description: 'Please select both student and faculty',
        variant: 'destructive',
      });
      return;
    }

    try {
      await assignMapping(selectedStudent, selectedFaculty);
      toast({ title: 'Mapping created successfully' });
      setSelectedStudent('');
      setSelectedFaculty('');
      fetchData(); // reload mappings
    } catch (err) {
      toast({ title: 'Failed to create mapping', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteMapping = async (id) => {
    try {
      await deleteMapping(id);
      toast({ title: 'Mapping deleted successfully' });
      setMappings((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      toast({ title: 'Failed to delete mapping', description: err.message, variant: 'destructive' });
    }
  };

  const unmappedStudents = students.filter(
    (s) => !mappings.some((m) => m.student?._id === s._id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Faculty-Student Mappings</h2>
        <p className="text-muted-foreground mt-2">Assign faculty advisors to students</p>
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
              {unmappedStudents.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name} - {s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger>
              <SelectValue placeholder="Select Faculty" />
            </SelectTrigger>
            <SelectContent>
              {faculty.map((f) => (
                <SelectItem key={f._id} value={f._id}>
                  {f.name} - {f.department}
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
          {mappings.map((m) => (
            <div
              key={m._id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{m.student?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.student?.email}
                  </p>
                </div>
                <div className="hidden md:block text-muted-foreground">→</div>
                <div>
                  <p className="font-medium">{m.faculty?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.faculty?.department}
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleDeleteMapping(m._id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
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
