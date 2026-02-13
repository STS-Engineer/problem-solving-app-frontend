import { FC, ReactNode } from "react";
import { clsx } from "clsx";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        "block text-sm font-medium text-gray-700 mb-1",
        className,
      )}
    >
      {children}
    </label>
  );
};

export default Label;
