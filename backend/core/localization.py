from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional, Tuple
import warnings

def get_localized_price(
    base_price: Decimal,
    country_code: Optional[str],
    currency_rates: Dict[str, Dict[str, str]],
    default_currency: str = "USD",
    default_symbol: str = "$",
    default_rate: Decimal = Decimal("1.0")
) -> Tuple[Decimal, str]:
    if not isinstance(base_price, Decimal):
      try:
        base_price = Decimal(str(base_price))
      except Exception as e:
        raise ValueError(f"base_price must be convertible to Decimal: {e}")

    if not isinstance(currency_rates, dict):
      raise ValueError("currency_rates must be a dictionary")

    if not country_code or not isinstance(country_code, str) or len(country_code) != 2:
      warnings.warn(f"Invalid country code: '{country_code}'. Using default currency.")
      country_code = default_currency

    country_code_lower = country_code.lower()
    currency_info = currency_rates.get(country_code_lower)

    if not currency_info:
      warnings.warn(f"No currency info for '{country_code}'. Using default.")
      currency_info = currency_rates.get(default_currency.lower(), {})

    try:
      rate = Decimal(str(currency_info.get("rate", default_rate)))
    except Exception as e:
      warnings.warn(f"Invalid rate for '{country_code}'. Using default: {e}")
      rate = default_rate

    symbol = currency_info.get("symbol")
    if not symbol:
      warnings.warn(f"No symbol for '{country_code}'. Using default.")
      symbol = default_symbol

    localized_price = (base_price * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return localized_price, symbol