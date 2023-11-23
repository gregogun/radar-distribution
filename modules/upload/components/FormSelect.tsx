import { Controller, useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/ui/Select";
import { RxChevronDown } from "react-icons/rx";
import { genres } from "@/data/genres";
import { UDLValues, udl } from "@/data/license";

interface FormSelectProps {
  name: string;
  values: typeof genres | UDLValues[keyof UDLValues] | any[];
  disabled?: boolean;
}

export const FormSelect = ({ values, name, disabled }: FormSelectProps) => {
  const { control, getValues } = useFormContext();

  const formatSelectValue = (value: string) => {
    const values = value.split("-");
    const formattedValues = values
      .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
      .join(" ");
    return formattedValues;
  };

  return (
    <Controller
      render={({ field: { onChange } }) => (
        <Select
          defaultValue={getValues(name)}
          onValueChange={(e) => onChange(e)}
          value={getValues(name)}
        >
          <SelectTrigger disabled={disabled}>
            <SelectValue />
            <SelectIcon>
              <RxChevronDown />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectContent sideOffset={8}>
              <SelectViewport>
                {values.map((value) => (
                  <SelectItem
                    css={{
                      textTransform: "capitalize",
                    }}
                    key={value}
                    value={value}
                  >
                    {formatSelectValue(value)}
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      )}
      name={name}
      control={control}
    />
  );
};
