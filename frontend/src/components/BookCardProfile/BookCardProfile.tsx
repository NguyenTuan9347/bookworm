import { UserProfileCardProps } from "../../shared/interfaces";

const BookProfileCard = ({
  name,
  avatarUrl,
  bio,
  isActive,
}: UserProfileCardProps) => {
  console.log(name, avatarUrl, bio, isActive);
  return (
    // Start with basic JSX structure
    <div>{/* Placeholder for content */}</div>
  );
};

export default BookProfileCard;
