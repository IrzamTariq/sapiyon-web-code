export const currencyFormatter = (
  input = 0,
  showZeros = false,
  currencyFormat = "TR-TRY",
) => {
  try {
    const [numberFormat, currency] = currencyFormat?.split("-");
    const Formatter = new Intl.NumberFormat(numberFormat ?? "TR", {
      style: "currency",
      currency: currency ?? "TRY",
      minimumFractionDigits: showZeros ? 2 : 0,
    });
    if (isNaN(+input)) {
      return Formatter.format(0);
    }
    return Formatter.format(+input);
  } catch (e) {
    return input;
  }
};
