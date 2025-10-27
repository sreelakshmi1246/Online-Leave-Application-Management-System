import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockFaculty } from '@/data/mockData';
import { Faculty } from '@/types';
import { FacultyDialog } from '@/components/faculty/FacultyDialog';
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import { toast } from '@/hooks/use-toast';

const FacultyPage = () => {
  const [faculty, setFaculty] = useState(mockFaculty);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | undefined>();
  const [deleteFaculty, setDeleteFaculty] = useState<Faculty | undefined>();

  const handleSave = (facultyMember: Faculty) => {
    if (editingFaculty) {
      setFaculty(faculty.map((f) => (f.id === facultyMember.id ? facultyMember : f)));
      toast({ title: 'Faculty updated successfully' });
    } else {
      setFaculty([...faculty, { ...facultyMember, id: Date.now().toString() }]);
      toast({ title: 'Faculty added successfully' });
    }
    setIsDialogOpen(false);
    setEditingFaculty(undefined);
  };

  const handleDelete = () => {
    if (deleteFaculty) {
      setFaculty(faculty.filter((f) => f.id !== deleteFaculty.id));
      toast({ title: 'Faculty deleted successfully' });
      setDeleteFaculty(undefined);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Faculty</h2>
          <p className="text-muted-foreground mt-2">
            Manage faculty members and advisors
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Faculty
        </Button>
      </div>

      <DataTable
        data={faculty}
        columns={columns}
        onEdit={(facultyMember) => {
          setEditingFaculty(facultyMember);
          setIsDialogOpen(true);
        }}
        onDelete={(facultyMember) => setDeleteFaculty(facultyMember)}
        searchPlaceholder="Search faculty..."
      />

      <FacultyDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingFaculty(undefined);
        }}
        faculty={editingFaculty}
        onSave={handleSave}
      />

      <DeleteDialog
        open={!!deleteFaculty}
        onOpenChange={(open) => !open && setDeleteFaculty(undefined)}
        onConfirm={handleDelete}
        title="Delete Faculty"
        description={`Are you sure you want to delete ${deleteFaculty?.name}? This action cannot be undone.`}
      />
    </div>
  );
};
//faculty
export default FacultyPage;
