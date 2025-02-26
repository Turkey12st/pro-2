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
  employmentNumber?: string;
  branch?: string;
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: {
    name: string;
    amount: number;
  }[];
  gosiSubscription: number;
  employeeGosiContribution: number;
  companyGosiContribution: number;
  medicalInsuranceCost: number;
  visaFees: number;
  transferFees: number;
  laborFees: number;
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
  contract_type: string;
  email: string;
  phone: string;
  photo_url?: string;
  documents?: { name: string; url: string; type: string }[];
  created_by: string;
  employment_number?: string;
  branch?: string;
  base_salary: number;
  housing_allowance: number;
  transportation_allowance: number;
  other_allowances: {
    name: string;
    amount: number;
  }[];
  gosi_subscription: number;
  employee_gosi_contribution: number;
  company_gosi_contribution: number;
  medical_insurance_cost: number;
  visa_fees: number;
  transfer_fees: number;
  labor_fees: number;
};

export type AllowanceType = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

export type SalaryRecord = {
  id: string;
  employeeId: string;
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: {
    name: string;
    amount: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  gosiSubscription: number;
  totalSalary: number;
  paymentDate: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
};

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
  contractType: dbEmployee.contract_type as 'full-time' | 'part-time' | 'contract',
  email: dbEmployee.email,
  phone: dbEmployee.phone,
  photoUrl: dbEmployee.photo_url,
  documents: dbEmployee.documents,
  created_by: dbEmployee.created_by,
  employmentNumber: dbEmployee.employment_number,
  branch: dbEmployee.branch,
  baseSalary: dbEmployee.base_salary,
  housingAllowance: dbEmployee.housing_allowance,
  transportationAllowance: dbEmployee.transportation_allowance,
  otherAllowances: dbEmployee.other_allowances,
  gosiSubscription: dbEmployee.gosi_subscription,
  employeeGosiContribution: dbEmployee.employee_gosi_contribution,
  companyGosiContribution: dbEmployee.company_gosi_contribution,
  medicalInsuranceCost: dbEmployee.medical_insurance_cost,
  visaFees: dbEmployee.visa_fees,
  transferFees: dbEmployee.transfer_fees,
  laborFees: dbEmployee.labor_fees
});

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
  created_by: employee.created_by,
  employment_number: employee.employmentNumber,
  branch: employee.branch,
  base_salary: employee.baseSalary,
  housing_allowance: employee.housingAllowance,
  transportation_allowance: employee.transportationAllowance,
  other_allowances: employee.otherAllowances,
  gosi_subscription: employee.gosiSubscription,
  employee_gosi_contribution: employee.employeeGosiContribution,
  company_gosi_contribution: employee.companyGosiContribution,
  medical_insurance_cost: employee.medicalInsuranceCost,
  visa_fees: employee.visaFees,
  transfer_fees: employee.transferFees,
  labor_fees: employee.laborFees
});
