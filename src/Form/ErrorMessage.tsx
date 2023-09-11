import { useFormContext } from "react-hook-form";

interface ErrorMessageProps {
  field: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(obj: Record<any, any>, path: string) {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj
      );

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);

  return result;
}

export function ErrorMessage({ field }: ErrorMessageProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const fieldError = get(errors, field);

  if (!fieldError) {
    return null;
  }

  return (
    <span className="font-bold text-xs text-red-500 mt-1">
      {fieldError.message?.toString()}
    </span>
  );
}
