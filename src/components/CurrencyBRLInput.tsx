import { Input } from "@chakra-ui/react";
import { NumericFormat } from "react-number-format";

type Props = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
};

export default function CurrencyBRLInput({ value, onChange, placeholder }: Props) {
  return (
    <NumericFormat
      value={value ?? ""}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      prefix="R$ "
      customInput={Input}
      placeholder={placeholder ?? "R$ 0,00"}
      onValueChange={(v) => {
        const num = v.floatValue;
        onChange(typeof num === "number" ? num : undefined);
      }}
    />
  );
}
