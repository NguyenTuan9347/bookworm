import geoip2.database
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from typing import Optional
from .config import settings
import ipaddress
from geoip2.models import Country

geoip_reader:Optional[geoip2.database.Reader] = None
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_client_ip(request: Request) -> Optional[str]:
    x_forwarded_for = request.headers.get('x-forwarded-for')
    print(request.headers)

    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
        return ip

    return request.client.host

@asynccontextmanager
async def lifespan(app: FastAPI):
    global geoip_reader
    db_path = settings.GEOIP_DATABASE_PATH
    
    if db_path:
        try:
            logger.info("Loading GeoIP database from: %s", db_path)
            geoip_reader = geoip2.database.Reader(db_path)
            logger.info("GeoIP database loaded successfully")
        except FileNotFoundError:
            logger.error("GeoIP database not found at: %s", db_path)
        except geoip2.errors.GeoIP2Error as e:
            logger.error("GeoIP database error: %s", e)
        except Exception as e:
            logger.error("Unexpected GeoIP database error: %s", e)
    else:
        logger.warning("GEOIP_DATABASE_PATH not configured")

    yield

    if geoip_reader:
        logger.info("Closing GeoIP database")
        geoip_reader.close()
        geoip_reader = None

def is_public_ip(ip_string):
    if not ip_string:
        return False
    
    try:
        ip = ipaddress.ip_address(ip_string)
        return not (ip.is_private or ip.is_loopback or 
                   ip.is_link_local or ip.is_multicast or 
                   ip.is_unspecified)
    except ValueError:
        return False

def get_geoip_data(request: Request):
    if not geoip_reader:
        return None

    ip_address = get_client_ip(request)
    if not ip_address or not is_public_ip(ip_address):
        logger.info("Skipping private IP: %s", ip_address)
        return None
    try:
        return geoip_reader.country(ip_address)
    except geoip2.errors.AddressNotFoundError:
        logger.debug("IP not found in database: %s", ip_address)
    except Exception as e:
        logger.error("GeoIP lookup error for %s: %s", ip_address, e)

    return None

def get_country_code(geoip_data=Depends(get_geoip_data)):
    if geoip_data and geoip_data.country and geoip_data.country.iso_code:
        return geoip_data.country.iso_code
    return settings.DEFAULT_COUNTRY_CODE