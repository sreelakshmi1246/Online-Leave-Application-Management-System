import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { FacultyDialog } from "@/components/faculty/FacultyDialog";
import { DeleteDialog } from "@/components/shared/DeleteDialog";

import { listUsers, createUser, deleteUser } from "@/services/user";

const FacultyPage = () => {
  const [faculty, setFaculty] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [deleteFaculty, setDeleteFaculty] = useState(null);

  // load all faculty from backend
  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await listUsers();
      const all = res.data || [];
      setFaculty(all.filter((u) => u.role === "faculty"));
    } catch (err) {
      toast({ title: "Error loading faculty", variant: "destructive" });
    }
  };

  const handleSave = async (data) => {
    try {
      await createUser({ ...data, role: "faculty" });

      toast({
        title: editingFaculty ? "Faculty updated" : "Faculty added"
      });

      setIsDialogOpen(false);
      setEditingFaculty(null);

      fetchFaculty();
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
      await deleteUser(deleteFaculty._id);
      toast({ title: "Faculty deleted" });
      setDeleteFaculty(null);
      fetchFaculty();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "employeeId", label: "Employee ID" },
    { key: "email", label: "Email" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Faculty</h2>
          <p className="text-muted-foreground mt-2">Manage faculty members</p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Faculty
        </Button>
      </div>

      <DataTable
        data={faculty}
        columns={columns}
        onEdit={(f) => {
          setEditingFaculty(f);
          setIsDialogOpen(true);
        }}
        onDelete={(f) => setDeleteFaculty(f)}
        searchPlaceholder="Search faculty..."
      />

      <FacultyDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingFaculty(null);
        }}
        faculty={editingFaculty}
        onSave={handleSave}
      />

      <DeleteDialog
        open={!!deleteFaculty}
        onOpenChange={(open) => !open && setDeleteFaculty(null)}
        onConfirm={handleDelete}
        title="Delete Faculty"
        description={`Are you sure you want to delete ${deleteFaculty?.name}?`}
      />
    </div>
  );
};

export default FacultyPage;
