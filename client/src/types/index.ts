export interface LeadershipValue {
  id: number;
  value: string;
  description: string;
}

export type Category = "card-pile" | "definitely-me" | "mostly-me" | "not-me";
export type SelectionCategory = "available" | "selected" | "core";

export interface SortedValues {
  "card-pile": LeadershipValue[];
  "definitely-me": LeadershipValue[];
  "mostly-me": LeadershipValue[];
  "not-me": LeadershipValue[];
}

export interface SelectedValues {
  "available": LeadershipValue[];
  "selected": LeadershipValue[];
  "core": LeadershipValue[];
}

export interface UserInfo {
  name: string;
  email: string;
  companyCode?: string;
}

export interface Submission {
  id: number;
  name: string;
  email: string;
  companyCode?: string;
  coreValues: string[];
  createdAt: string;
}
