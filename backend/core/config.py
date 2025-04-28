import os
import warnings
from typing import Any, List, Literal

try:
    from dotenv import load_dotenv
except ImportError:
    raise ImportError("Please install python-dotenv: pip install python-dotenv")

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_GEOIP_DB_PATH = PROJECT_ROOT / "shared" / "GeoLite2-Country" / "GeoLite2-Country.mmdb"

def parse_cors_value(value: Any) -> List[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value]
    if not isinstance(value, str):
        raise ValueError(f"Invalid CORS value type: {type(value)}. Expected string or list.")
    value = value.strip()
    if not value:
        return []
    if value.startswith("[") and value.endswith("]"):
        content = value[1:-1].strip()
        if not content:
            return []
        return [item.strip().strip("'\"") for item in content.split(",")]
    elif "," in value:
        return [item.strip() for item in value.split(",")]
    else:
        return [value]
    
import csv
import os
import warnings
from decimal import Decimal, InvalidOperation
from typing import Dict, Any, Union

def load_currency_rates_from_csv(csv_filepath: str) -> Dict[str, Dict[str, Union[str, Decimal]]]:
    currency_data: Dict[str, Dict[str, Union[str, Decimal]]] = {}

    if not os.path.exists(csv_filepath):
        raise FileNotFoundError(f"Currency CSV file not found at: {csv_filepath}")

    try:
        with open(csv_filepath, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile, delimiter="|")

            header_map = {h.lower().strip(): h for h in reader.fieldnames or []}
            required_headers = ['country code', 'currency symbol', 'rate']
            mapped_headers = {}
            missing_headers = []

            for req_h in required_headers:
                if req_h in header_map:
                    mapped_headers[req_h] = header_map[req_h]
                else:
                    missing_headers.append(req_h)

            if missing_headers:
                 raise ValueError(f"CSV file '{csv_filepath}' is missing required headers: {', '.join(missing_headers)}")

            country_code_col = mapped_headers['country code']
            symbol_col = mapped_headers['currency symbol']
            rate_col = mapped_headers['rate']

            for row_num, row in enumerate(reader, start=2):
                country_code = row.get(country_code_col, "").strip().lower()
                symbol = row.get(symbol_col, "").strip()
                rate_str = row.get(rate_col, "").strip()

                if not country_code or not symbol or not rate_str:
                    warnings.warn(f"Skipping row {row_num} in '{csv_filepath}' due to missing data.", stacklevel=2)
                    continue

                try:
                    rate_decimal = Decimal(rate_str)
                except InvalidOperation:
                    warnings.warn(
                        f"Skipping row {row_num} in '{csv_filepath}' due to invalid rate value: '{rate_str}'. "
                        f"Could not convert to Decimal.", stacklevel=2
                    )
                    continue

                currency_data[country_code] = {
                    'symbol': symbol,
                    'rate': rate_decimal
                }

    except FileNotFoundError:
        raise
    except Exception as e:
        warnings.warn(f"Error reading currency CSV file '{csv_filepath}': {e}", stacklevel=2)
        return {}

    if not currency_data:
         warnings.warn(f"No valid currency data loaded from '{csv_filepath}'.", stacklevel=2)

    return currency_data

class Settings:
    API_PREFIX_STR: str = ""
    REFRESH_TOKEN_KEY: str = "refresh-token"
    COOKIES_HTTPS_ONLY: bool = True
    COOKIES_HTTP_ONLY: bool = True
    COOKIES_SAMESITE_POLICY: str = "lax"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 7 * 60 * 24
    FRONTEND_HOST: str = "http://localhost:5173"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    ALLOWED_ENVIRONMENTS = ("local", "staging", "production")
    BACKEND_CORS_ORIGINS_DEFAULT: List[str] = []
    ADMIN_EMAIL: str = "myname@gmail.com"
    ADMIN_PASSWORD: str = "luck2luck"
    POSTGRES_PORT: int = 5432
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = ""
    
    DEFAULT_COUNTRY_CODE = "us"
    GEOIP_DATABASE_PATH: str = DEFAULT_GEOIP_DB_PATH
    SECRET_KEY: str
    ACCESS_SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    PROJECT_NAME: str
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    BACKEND_CORS_ORIGINS: List[str]
    CURRENCY_RATES_DICT = {}
    def __init__(self, env_file: str = ".env"):
        if not os.path.exists(env_file):
            warnings.warn(f".env file not found at {os.path.abspath(env_file)}", stacklevel=1)
            loaded = False
        else:
            loaded = load_dotenv(dotenv_path=env_file, override=True)
            if not loaded:
                warnings.warn(f"Could not load environment variables from {env_file}", stacklevel=1)

        def _get_str(key: str, default: str | None = None, required: bool = False) -> str | None:
            val = os.getenv(key, default)
            if required and val is None:
                raise ValueError(f"Missing required environment variable: {key}")
            return val

        def _get_int(key: str, default: int) -> int:
            val_str = os.getenv(key)
            if val_str is None:
                return default
            try:
                return int(val_str)
            except (ValueError, TypeError):
                warnings.warn(f"Invalid integer value for {key} ('{val_str}'), using default {default}", stacklevel=2)
                return default

        def _get_bool(key: str, default: bool) -> bool:
            val_str = os.getenv(key)
            if val_str is None:
                return default
            return val_str.lower() in ("true", "1", "t", "yes", "y")

        self.API_PREFIX_STR = _get_str("API_PREFIX_STR", self.API_PREFIX_STR)
        self.SECRET_KEY = _get_str("SECRET_KEY", required=True)
        self.ACCESS_SECRET_KEY = _get_str("ACCESS_SECRET_KEY", required=True)
        self.REFRESH_SECRET_KEY = _get_str("REFRESH_SECRET_KEY", required=True)
        self.REFRESH_TOKEN_KEY = _get_str("REFRESH_TOKEN_KEY", self.REFRESH_TOKEN_KEY)

        self.COOKIES_HTTPS_ONLY = _get_bool("COOKIES_HTTPS_ONLY", self.COOKIES_HTTPS_ONLY)
        self.COOKIES_HTTP_ONLY = _get_bool("COOKIES_HTTP_ONLY", self.COOKIES_HTTP_ONLY)
        self.COOKIES_SAMESITE_POLICY = _get_str("COOKIES_SAMESITE_POLICY", self.COOKIES_SAMESITE_POLICY)

        self.ACCESS_TOKEN_EXPIRE_MINUTES = _get_int("ACCESS_TOKEN_EXPIRE_MINUTES", self.ACCESS_TOKEN_EXPIRE_MINUTES)
        self.REFRESH_TOKEN_EXPIRE_MINUTES = _get_int("REFRESH_TOKEN_EXPIRE_MINUTES", self.REFRESH_TOKEN_EXPIRE_MINUTES)

        self.FRONTEND_HOST = _get_str("FRONTEND_HOST", self.FRONTEND_HOST)

        raw_env = _get_str("ENVIRONMENT", self.ENVIRONMENT)
        if raw_env not in self.ALLOWED_ENVIRONMENTS:
            raise ValueError(f"Invalid ENVIRONMENT: '{raw_env}'. Must be one of {self.ALLOWED_ENVIRONMENTS}")
        self.ENVIRONMENT = raw_env

        raw_cors = os.getenv("BACKEND_CORS_ORIGINS")
        try:
            if raw_cors is None:
                self.BACKEND_CORS_ORIGINS = self.BACKEND_CORS_ORIGINS_DEFAULT
            else:
                self.BACKEND_CORS_ORIGINS = parse_cors_value(raw_cors)
        except ValueError as e:
            raise ValueError(f"Error parsing BACKEND_CORS_ORIGINS: {e}") from e

        self.ADMIN_EMAIL = _get_str("ADMIN_EMAIL", self.ADMIN_EMAIL)
        self.ADMIN_PASSWORD = _get_str("ADMIN_PASSWORD", self.ADMIN_PASSWORD)

        self.PROJECT_NAME = _get_str("PROJECT_NAME", required=True)
        self.POSTGRES_SERVER = _get_str("POSTGRES_SERVER", required=True)
        self.POSTGRES_PORT = _get_int("POSTGRES_PORT", self.POSTGRES_PORT)
        self.POSTGRES_USER = _get_str("POSTGRES_USER", required=True)
        self.POSTGRES_PASSWORD = _get_str("POSTGRES_PASSWORD", self.POSTGRES_PASSWORD)
        self.POSTGRES_DB = _get_str("POSTGRES_DB", self.POSTGRES_DB)

    @property
    def all_cors_origins(self) -> list[str]:
        backend_origins = self.BACKEND_CORS_ORIGINS if isinstance(self.BACKEND_CORS_ORIGINS, list) else []
        processed_origins = {str(origin).rstrip("/") for origin in backend_origins if origin}
        if self.FRONTEND_HOST:
            processed_origins.add(str(self.FRONTEND_HOST).rstrip("/"))
        return sorted(list(processed_origins))

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:    
        scheme = "postgresql"
        user = self.POSTGRES_USER
        password = f":{self.POSTGRES_PASSWORD}" if self.POSTGRES_PASSWORD else ""
        host = self.POSTGRES_SERVER
        port = f":{self.POSTGRES_PORT}" if self.POSTGRES_PORT != 5432 else ""
        db = f"/{self.POSTGRES_DB}" if self.POSTGRES_DB else ""
        if not all([user, host]):
            raise ValueError("Cannot build SQLALCHEMY_DATABASE_URI: Missing POSTGRES_USER or POSTGRES_SERVER")
        return f"{scheme}://{user}{password}@{host}{port}{db}"

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = f'The value of {var_name} is "changethis", for security, please change it.'
            if self.ENVIRONMENT == "local":
                warnings.warn(message, stacklevel=2)
            else:
                raise ValueError(message)

try:
    import os
    base_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(base_dir, ".env")
    settings = Settings(env_file=env_path)
    settings.CURRENCY_RATES_DICT = load_currency_rates_from_csv(os.path.join(base_dir, "currencies.csv"))

    print(f"Project Name: {settings.PROJECT_NAME}")
    print(f"API Prefix: {settings.API_PREFIX_STR}")
    print(f"Database URI: {settings.SQLALCHEMY_DATABASE_URI}")
    print(f"All CORS Origins: {settings.all_cors_origins}")
except (ValueError, ImportError) as e:
    print(f"FATAL ERROR: Could not initialize settings - {e}")
    import sys
    sys.exit(1)
