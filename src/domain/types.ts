export type Family = {
  id: string;
  name: string;
  observations?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  facilitator_name?: string;
  facilitator_contact?: string;
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  bank_pix_key?: string;
  sponsor_id?: string;
};

export type Delegate = {
  id: string;
  family_id: string;
  name: string;
};

export type Periodicity = "weekly" | "monthly" | "yearly";

export type BillRule = {
  id: string;
  family_id: string;
  delegate_id: string | null;

  name: string;
  description: string | null;
  amount: number;
  note: string | null;

  first_due_date: string; // date
  is_recurring: boolean;
  periodicity: Periodicity | null;
  repeat_until: string | null;
  drive_url?: string;
};

export type BillOccurrence = {
  id: string;
  family_id: string;
  rule_id: string;
  delegate_id: string | null;

  name: string;
  description: string | null;
  amount: number;
  note: string | null;

  due_date: string; // date
  paid: boolean;
  received: boolean;
  payment_date: string | null;
  drive_url?: string;
};
