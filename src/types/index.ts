export interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  department: string;
  year: number;
  facultyAdvisorId?: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
}

export interface Mapping {
  id: string;
  studentId: string;
  facultyId: string;
  assignedDate: string;
}
