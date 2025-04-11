import random
import datetime
from decimal import Decimal
from typing import Type, TypeVar, Generator, Optional, Union, get_type_hints, Any
from sqlmodel import SQLModel
from pydantic_core import PydanticUndefined 
from faker import Faker
from enum import Enum

fake = Faker()

# Type variable for better type hinting
T = TypeVar('T', bound=SQLModel)

# Helper to get the actual type from Optional or Union
def get_base_type(type_hint: Any) -> Any:
    """Gets the base type from Optional[T] or Union[T, None]."""
    origin = getattr(type_hint, '__origin__', None)
    args = getattr(type_hint, '__args__', ())

    if origin is Union:
        non_none_args = [arg for arg in args if arg is not type(None)]
        if len(non_none_args) == 1:
            return non_none_args[0]
    elif origin is Optional: # Optional[T] is internally Union[T, None]
         if len(args) > 0 and args[0] is not type(None):
             return args[0]
    return type_hint # Return original if not Optional/Union or complex Union

def generate_sqlmodel_instances(
    model_cls: Type[T],
    k: int,
    default_int_min: int = 0,
    default_int_max: int = 1000,
    default_float_min: float = 0.0,
    default_float_max: float = 1.0,
    default_str_min_len: int = 5,
    default_str_max_len: int = 50,
    allow_none_for_optional: bool = True, # Control if Optional fields can be None
    none_probability: float = 0.1 # Probability of setting an Optional field to None
) -> Generator[T, None, None]:
    """
    Generates 'k' instances of a SQLModel class with random data based on field types and constraints.

    Args:
        model_cls: The SQLModel class to instantiate.
        k: The number of instances to generate.
        default_int_min: Default minimum value for int fields without constraints.
        default_int_max: Default maximum value for int fields without constraints.
        default_float_min: Default minimum value for float fields without constraints.
        default_float_max: Default maximum value for float fields without constraints.
        default_str_min_len: Default minimum length for string fields without constraints.
        default_str_max_len: Default maximum length for string fields without constraints.
        allow_none_for_optional: If True, Optional fields have a chance to be None.
        none_probability: The probability (0.0 to 1.0) that an Optional field will be None.

    Yields:
        Instances of the provided SQLModel class.
    """
    type_hints = get_type_hints(model_cls)

    for _ in range(k):
        instance_data = {}
        for field_name, field_info in model_cls.model_fields.items():
            # Skip private attributes if any (though SQLModel usually uses public)
            if field_name.startswith('_'):
                continue

            # --- Determine Field Type and Optionality ---
            raw_type_hint = type_hints.get(field_name)
            base_type = get_base_type(raw_type_hint)
            is_optional = (
                getattr(raw_type_hint, '__origin__', None) is Union
                and type(None) in getattr(raw_type_hint, '__args__', ())
            ) or field_info.default is not PydanticUndefined # Also consider fields with defaults as potentially optional in generation

            # --- Handle Optional Null Assignment ---
            # Special case for primary keys often defaulted to None
            is_primary = getattr(field_info, 'primary_key', False)
            if is_primary and field_info.default is None and allow_none_for_optional:
                 instance_data[field_name] = None
                 continue # Skip generation for PKs defaulted to None

            # General optional field handling
            if is_optional and allow_none_for_optional and random.random() < none_probability:
                 instance_data[field_name] = None
                 continue # Skip generation, assign None

            # --- Extract Constraints ---
            constraints = {
                'min_length': getattr(field_info, 'min_length', None),
                'max_length': getattr(field_info, 'max_length', None),
                'ge': getattr(field_info, 'ge', None), # Greater than or equal
                'le': getattr(field_info, 'le', None), # Less than or equal
                'gt': getattr(field_info, 'gt', None), # Greater than
                'lt': getattr(field_info, 'lt', None), # Less than
            }
            # Sometimes constraints are in metadata (more common in Pydantic v2 Field)
            for item in getattr(field_info, 'metadata', []):
                if hasattr(item, 'min_length'): constraints['min_length'] = item.min_length
                if hasattr(item, 'max_length'): constraints['max_length'] = item.max_length
                if hasattr(item, 'ge'): constraints['ge'] = item.ge
                if hasattr(item, 'le'): constraints['le'] = item.le
                if hasattr(item, 'gt'): constraints['gt'] = item.gt
                if hasattr(item, 'lt'): constraints['lt'] = item.lt


            value = None # Initialize value for the field

            # --- Generate Value Based on Type ---
            try:
                if issubclass(base_type, bool):
                    value = random.choice([True, False])

                elif issubclass(base_type, int):
                    min_val = constraints['ge'] if constraints['ge'] is not None else default_int_min
                    max_val = constraints['le'] if constraints['le'] is not None else default_int_max
                    if constraints['gt'] is not None: min_val = max(min_val, constraints['gt'] + 1)
                    if constraints['lt'] is not None: max_val = min(max_val, constraints['lt'] - 1)

                    if min_val > max_val: # Handle impossible constraints
                        print(f"Warning: Field '{field_name}' has conflicting constraints (min>max). Using defaults.")
                        min_val, max_val = default_int_min, default_int_max
                    value = random.randint(min_val, max_val)

                elif issubclass(base_type, float):
                    min_val = constraints['ge'] if constraints['ge'] is not None else default_float_min
                    max_val = constraints['le'] if constraints['le'] is not None else default_float_max
                    if constraints['gt'] is not None: min_val = max(min_val, constraints['gt'] + 1e-9) # Approx >
                    if constraints['lt'] is not None: max_val = min(max_val, constraints['lt'] - 1e-9) # Approx <

                    if min_val > max_val: # Handle impossible constraints
                        print(f"Warning: Field '{field_name}' has conflicting constraints (min>max). Using defaults.")
                        min_val, max_val = default_float_min, default_float_max
                    value = random.uniform(min_val, max_val)

                elif issubclass(base_type, Decimal):
                     # Similar logic to float, but creating Decimal
                    min_val_f = constraints['ge'] if constraints['ge'] is not None else default_float_min
                    max_val_f = constraints['le'] if constraints['le'] is not None else default_float_max
                    if constraints['gt'] is not None: min_val_f = max(min_val_f, float(constraints['gt']) + 1e-9) # Approx >
                    if constraints['lt'] is not None: max_val_f = min(max_val_f, float(constraints['lt']) - 1e-9) # Approx <

                    if min_val_f > max_val_f: # Handle impossible constraints
                        print(f"Warning: Field '{field_name}' has conflicting constraints (min>max). Using defaults.")
                        min_val_f, max_val_f = default_float_min, default_float_max

                    # Generate float and convert, controlling precision might be needed
                    precision = getattr(field_info, 'max_digits', 10) # Example: check for decimal places/max_digits if needed
                    decimal_places = getattr(field_info, 'decimal_places', 2)
                    # Generate random float and round it before converting to Decimal
                    rand_float = random.uniform(min_val_f, max_val_f)
                    value = Decimal(f'{rand_float:.{decimal_places}f}')


                elif issubclass(base_type, str):
                    min_len = constraints['min_length'] if constraints['min_length'] is not None else default_str_min_len
                    max_len = constraints['max_length'] if constraints['max_length'] is not None else default_str_max_len

                    if min_len > max_len: # Handle impossible constraints
                         print(f"Warning: Field '{field_name}' has conflicting length constraints (min>max). Using defaults.")
                         min_len, max_len = default_str_min_len, default_str_max_len

                    # Ensure min_len and max_len are positive
                    min_len = max(0, min_len)
                    max_len = max(min_len, max_len) # Ensure max_len >= min_len

                    # Generate string of random length within the bounds
                    length = random.randint(min_len, max_len)
                    # Use faker.pystr for random characters respecting length exactly
                    value = fake.pystr(min_chars=length, max_chars=length)
                 
                elif issubclass(base_type, datetime.datetime):
                    # Generate datetime within the current year by default
                    current_year = datetime.datetime.now().year
                    start_date = datetime.datetime(current_year, 1, 1, 0, 0, 0)
                    end_date = datetime.datetime(current_year, 12, 31, 23, 59, 59)
                    value = fake.date_time_between(start_date=start_date, end_date=end_date)

                elif issubclass(base_type, datetime.date):
                    # Generate date within the current year by default
                    current_year = datetime.datetime.now().year
                    start_date = datetime.date(current_year, 1, 1)
                    end_date = datetime.date(current_year, 12, 31)
                    value = fake.date_between(start_date=start_date, end_date=end_date)

                elif issubclass(base_type, datetime.time):
                     value = fake.time_object()

                # Handle Enums by choosing a random member
                elif isinstance(base_type, type) and issubclass(base_type, Enum):
                    value = random.choice(list(base_type))

                # Handle List types (basic implementation: empty list or list of basic types)
                elif base_type.__origin__ is list if hasattr(base_type, '__origin__') else False:
                     list_item_type = base_type.__args__[0] if hasattr(base_type, '__args__') else None
                     if list_item_type:
                         # Basic: generate a short list of items (e.g., 0-5 items)
                         num_items = random.randint(0, 5)
                         # Recursive call or simpler generation for basic types needed here
                         # For simplicity, let's generate an empty list or list of strings/ints for now
                         if issubclass(list_item_type, (str, int, float)):
                             value = [fake.pystr(min_chars=3, max_chars=10) if issubclass(list_item_type, str) else
                                      random.randint(0, 100) if issubclass(list_item_type, int) else
                                      random.uniform(0,1)
                                      for _ in range(num_items)]
                         else:
                             value = [] # Default to empty list for complex nested types
                     else:
                        value = [] # Default to empty list if item type not found

                else:
                    # Fallback for unsupported types
                    print(f"Warning: Unsupported type '{base_type}' for field '{field_name}'. Setting to None.")
                    value = None

            except Exception as e:
                 print(f"Error generating value for field '{field_name}' (type: {base_type}): {e}")
                 value = None # Assign None if generation fails

            instance_data[field_name] = value

        try:
            instance = model_cls.model_validate(instance_data)
            yield instance
        except Exception as e:
            print(f"Error creating instance of {model_cls.__name__} with data: {instance_data}")
            print(f"Validation Error: {e}")

