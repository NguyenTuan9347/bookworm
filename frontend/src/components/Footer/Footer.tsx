import { AdditionalInfo } from "../../shared/interfaces";

const Footer = (additionalInfo: AdditionalInfo) => {
  return (
    <footer className="fixed flex flex-row bottom-0 left-0 w-full px-4 py-3 bg-gray-200 items-center">
      <div className="flex items-center w-full">
        <img
          src="https://placehold.co/64x64"
          alt="Bookworm Logo"
          className="h-12 w-12"
        />
        <div className="ml-3 flex flex-col text-sm">
          <p className="font-bold">{additionalInfo.applicationName}</p>
          <p className="text-gray-600">{additionalInfo.address}</p>
          <p className="text-gray-600">{additionalInfo.phoneNumber}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
