import { lineSpinner } from "ldrs";

lineSpinner.register();

function Loader({
  size,
  color,
  stroke,
}: {
  size?: string;
  color?: string;
  stroke?: string;
}) {
  return (
    <l-line-spinner
      size={size || "40"}
      stroke={stroke || "3"}
      speed="1"
      color={color || "gray"}
    ></l-line-spinner>
  );
}

export default Loader;
