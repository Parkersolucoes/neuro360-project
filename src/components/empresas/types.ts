
export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  plan: "basic" | "pro" | "enterprise";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  usersCount: number;
  lastActivity: string;
}

export interface CompanyFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  plan: "basic" | "pro" | "enterprise";
}
