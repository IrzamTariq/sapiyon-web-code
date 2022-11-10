export default function numberFormatter(input = 0, minimumFractionDigits = 0) {
  const Formatter = new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
    minimumFractionDigits,
  });

  return Formatter.format(input);
}
