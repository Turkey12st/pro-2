
export type Employee = {
  id: string;
  created_at: string;
  name: string;
  identityNumber: string;
  birthDate: string;
  nationality: string;
  position: string;
  department: string;
  salary: number;
  joiningDate: string;
  contractType: 'full-time' | 'part-time' | 'contract';
  email: string;
  phone: string;
  photoUrl?: string;
  documents?: { name: string; url: string; type: string }[];
  created_by: string;
};

export type EmployeeFilter = {
  department?: string;
  position?: string;
  contractType?: string;
};
