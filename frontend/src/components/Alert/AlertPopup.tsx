import { AlertComponentProps } from "@/shared/interfaces";
export const AlertPopup = ({
  title,
  description,
  className,
}: AlertComponentProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-30">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 max-w-md ${className}`}
      >
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};
