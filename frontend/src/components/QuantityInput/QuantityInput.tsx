interface QuantityInputProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onMinReached?: () => void;
  onMaxReached?: () => void;
  className?: string;
}

const QuantityInput = ({
  min,
  max,
  value,
  onChange,
  onMinReached,
  onMaxReached,
  className = "",
}: QuantityInputProps) => {
  const handleIncrement = () => {
    if (value < max) {
      const newValue = value + 1;
      onChange(newValue);
      if (newValue === max && onMaxReached) onMaxReached();
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      const newValue = value - 1;
      onChange(newValue);
      if (newValue === min && onMinReached) onMinReached();
    }
  };

  return (
    <div className={`flex items-center justify-center ${className} mt-1 mb-1`}>
      <button
        onClick={handleDecrement}
        disabled={value <= min}
        className="flex-1/5 rounded-l-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        -
      </button>
      <span className="flex-3/5 border-y border-gray-300 px-3 py-2 text-center bg-white">
        {value}
      </span>
      <button
        onClick={handleIncrement}
        disabled={value >= max}
        className="flex-1/5 rounded-r-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
