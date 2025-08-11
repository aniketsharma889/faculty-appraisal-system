const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  size = "medium",
  className = "",
  disabled = false
}) => {
  const baseStyles = "rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors duration-200 inline-flex items-center justify-center";

  const variants = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-300",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-300",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-300",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300",
  };

  const sizes = {
    small: "px-2 md:px-2 lg:px-3 py-1 md:py-1 lg:py-1.5 text-xs md:text-xs lg:text-sm",
    medium: "px-3 md:px-3 lg:px-4 py-1.5 md:py-1.5 lg:py-2 text-sm md:text-sm lg:text-base",
    large: "px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 text-base md:text-base lg:text-lg",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? disabledStyles : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;