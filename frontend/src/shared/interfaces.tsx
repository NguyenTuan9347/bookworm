export interface Link {
  ref: string;
  label: string;
}

export interface Cart extends Link {
  countItem: number;
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
  cart: Cart;
}

export interface UserProfileCardProps {
  name: string;
  avatarUrl?: string;
  bio: string;
  isActive: boolean;
}
