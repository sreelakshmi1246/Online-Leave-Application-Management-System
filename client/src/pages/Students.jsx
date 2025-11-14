import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StudentDialog } from '@/components/students/StudentDialog';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { listUsers, createUser, deleteUser } from '@/services/user';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);

  // Load from backend
  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await listUsers();
      const all = res.data || [];
      setStudents(all.filter((u) => u.role === 'student'));
    } catch (err) {
      toast({ title: "Error loading students", variant: "destructive" });
    }
  };

  const handleSave = async (data) => {
    try {
      await createUser({ ...data, role: "student" });

      toast({ title: editingStudent ? "Student updated" : "Student added" });

      setIsDialogOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteStudent._id);
      toast({ title: "Student deleted" });
      setDeleteStudent(null);
      fetchStudents();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'rollNo', label: 'Roll No' },
    { key: 'email', label: 'Email' },
    { key: 'program', label: 'Program' },
    { key: 'department', label: 'Department' },
    { key: 'year', label: 'Year', render: (s) => `Year ${s.year}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Students</h2>
          <p className="text-muted-foreground mt-2">
            Manage student records 
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </Button>
      </div>

      {/* Table */}
      <DataTable 
        data={students} 
        columns={columns}
        onEdit={(s) => { setEditingStudent(s); setIsDialogOpen(true); }}
        onDelete={(s) => setDeleteStudent(s)}
        searchPlaceholder="Search students..."
      />

      {/* Dialog */}
      <StudentDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingStudent(null);
        }}
        student={editingStudent}
        onSave={handleSave}
      />

      {/* Delete */}
      <DeleteDialog
        open={!!deleteStudent}
        onOpenChange={(open) => !open && setDeleteStudent(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteStudent?.name}?`}
      />
    </div>
  );
};

export default Students;
