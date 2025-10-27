import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockStudents, mockFaculty } from '@/data/mockData';
import { Student } from '@/types';
import { StudentDialog } from '@/components/students/StudentDialog';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { toast } from '@/hooks/use-toast';

const Students = () => {
  const [students, setStudents] = useState(mockStudents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [deleteStudent, setDeleteStudent] = useState<Student | undefined>();

  const handleSave = (student: Student) => {
    if (editingStudent) {
      setStudents(students.map((s) => (s.id === student.id ? student : s)));
      toast({ title: 'Student updated successfully' });
    } else {
      setStudents([...students, { ...student, id: Date.now().toString() }]);
      toast({ title: 'Student added successfully' });
    }
    setIsDialogOpen(false);
    setEditingStudent(undefined);
  };

  const handleDelete = () => {
    if (deleteStudent) {
      setStudents(students.filter((s) => s.id !== deleteStudent.id));
      toast({ title: 'Student deleted successfully' });
      setDeleteStudent(undefined);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'enrollmentNumber', label: 'Enrollment No.' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'year', label: 'Year', render: (s: Student) => `Year ${s.year}` },
    {
      key: 'facultyAdvisor',
      label: 'Faculty Advisor',
      render: (s: Student) => {
        const faculty = mockFaculty.find((f) => f.id === s.facultyAdvisorId);
        return faculty ? faculty.name : '-';
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Students</h2>
          <p className="text-muted-foreground mt-2">
            Manage student records and information
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      <DataTable
        data={students}
        columns={columns}
        onEdit={(student) => {
          setEditingStudent(student);
          setIsDialogOpen(true);
        }}
        onDelete={(student) => setDeleteStudent(student)}
        searchPlaceholder="Search students..."
      />

      <StudentDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingStudent(undefined);
        }}
        student={editingStudent}
        onSave={handleSave}
      />

      <DeleteDialog
        open={!!deleteStudent}
        onOpenChange={(open) => !open && setDeleteStudent(undefined)}
        onConfirm={handleDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteStudent?.name}? This action cannot be undone.`}
      />
    </div>
  );
};
//student
export default Students;
