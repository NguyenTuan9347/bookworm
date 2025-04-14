export interface Link {
  ref: string;
  label: string;
}

export interface CartState extends Link {
  countItem: number;
  setCount: (newCount: number) => void;
}

export interface AdditionalInfo {
  companyName?: string;
  applicationName: string;
  address: string;
  phoneNumber: string;
}

export interface NavBarProps {
  links: Link[];
  signInMetadata: Link;
}

export interface UserProfileCardProps {
  name: string;
  avatarUrl?: string;
  bio: string;
  isActive: boolean;
}
