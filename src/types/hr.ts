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
  costBreakdown?: any;
  employeeType?: string;
  gosiDetails?: any;
  documentsExpiry?: any[];
};

export type DbEmployee = {
  id: string;
  name: string;
  identity_number: string;
  nationality: string;
  birth_date: string;
  position: string;
  department: string;
  contract_type: string;
  joining_date: string;
  email: string;
  phone: string;
  salary: number;
  base_salary: number;
  housing_allowance: number;
  transportation_allowance: number;
  other_allowances: any[];
  documents: { name: string; url: string; type: string; }[];
  photo_url?: string;
  employment_number?: string;
  branch?: string;
  gosi_subscription?: number;
  employee_gosi_contribution?: number;
  company_gosi_contribution?: number;
  medical_insurance_cost?: number;
  visa_fees?: number;
  transfer_fees?: number;
  labor_fees?: number;
  cost_breakdown: any;
  created_at: string;
  created_by: string;
  employee_type?: string;
  gosi_details?: any;
  documents_expiry?: any[];
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

export function mapDbEmployeeToEmployee(data: DbEmployee | any): Employee {
  // Create documents array safely
  const documents = Array.isArray(data.documents) ? data.documents : [];
  
  return {
    id: data.id,
    created_at: data.created_at,
    name: data.name,
    identityNumber: data.identity_number,
    birthDate: data.birth_date,
    nationality: data.nationality,
    position: data.position,
    department: data.department,
    contractType: data.contract_type as 'full-time' | 'part-time' | 'contract',
    joiningDate: data.joining_date,
    email: data.email,
    phone: data.phone,
    salary: data.salary,
    baseSalary: data.base_salary,
    housingAllowance: data.housing_allowance,
    transportationAllowance: data.transportation_allowance,
    otherAllowances: data.other_allowances || [],
    documents: documents.map((doc: any) => ({
      name: doc.name || '',
      url: doc.url || '',
      type: doc.type || ''
    })),
    photoUrl: data.photo_url,
    employmentNumber: data.employment_number,
    branch: data.branch,
    created_by: data.created_by,
    gosiSubscription: data.gosi_subscription || 0,
    employeeGosiContribution: data.employee_gosi_contribution || 0,
    companyGosiContribution: data.company_gosi_contribution || 0,
    medicalInsuranceCost: data.medical_insurance_cost || 0,
    visaFees: data.visa_fees || 0,
    transferFees: data.transfer_fees || 0,
    laborFees: data.labor_fees || 0,
    costBreakdown: data.cost_breakdown,
    employeeType: data.employee_type,
    gosiDetails: data.gosi_details,
    documentsExpiry: data.documents_expiry,
  };
}

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
  documents: employee.documents || [],
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
  labor_fees: employee.laborFees,
  cost_breakdown: employee.costBreakdown || {},
  employee_type: employee.employeeType,
  gosi_details: employee.gosiDetails,
  documents_expiry: employee.documentsExpiry
});
