
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

export type DbEmployee = {
  id: string;
  created_at: string;
  name: string;
  identity_number: string;
  birth_date: string;
  nationality: string;
  position: string;
  department: string;
  salary: number;
  joining_date: string;
  contract_type: 'full-time' | 'part-time' | 'contract';
  email: string;
  phone: string;
  photo_url?: string;
  documents?: { name: string; url: string; type: string }[];
  created_by: string;
};

// Helper function to convert database employee to frontend employee
export const mapDbEmployeeToEmployee = (dbEmployee: DbEmployee): Employee => ({
  id: dbEmployee.id,
  created_at: dbEmployee.created_at,
  name: dbEmployee.name,
  identityNumber: dbEmployee.identity_number,
  birthDate: dbEmployee.birth_date,
  nationality: dbEmployee.nationality,
  position: dbEmployee.position,
  department: dbEmployee.department,
  salary: dbEmployee.salary,
  joiningDate: dbEmployee.joining_date,
  contractType: dbEmployee.contract_type,
  email: dbEmployee.email,
  phone: dbEmployee.phone,
  photoUrl: dbEmployee.photo_url,
  documents: dbEmployee.documents,
  created_by: dbEmployee.created_by
});

// Helper function to convert frontend employee to database employee
export const mapEmployeeToDbEmployee = (employee: Employee): DbEmployee => ({
  id: employee.id,
  created_at: employee.created_at,
  name: employee.name,
  identity_number: employee.identityNumber,
  birth_date: employee.birthDate,
  nationality: employee.nationality,
  position: employee.position,
  department: employee.department,
  salary: employee.salary,
  joining_date: employee.joiningDate,
  contract_type: employee.contractType,
  email: employee.email,
  phone: employee.phone,
  photo_url: employee.photoUrl,
  documents: employee.documents,
  created_by: employee.created_by
});
