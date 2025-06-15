import geoip2.database
import os
from django.utils import timezone
GEOIP_DB_PATH = os.path.join(os.path.dirname(__file__), 'GeoLite2-City.mmdb')

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR', '')

def get_location_from_ip(ip):
    try:
        with geoip2.database.Reader(GEOIP_DB_PATH) as reader:
            response = reader.city(ip)
            city = response.city.name or ''
            country = response.country.name or ''
            return f"{city}, {country}"
    except:
        return "Unknown"
    
def user_profile_path(instance, filename):
    ext = os.path.splitext(filename)[1] 
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    new_name = f"{instance.id}_{timestamp}{ext}"
    return f"profiles/{new_name}"
def file_path(instance, filename):
    ext = os.path.splitext(filename)[1] 
    real_name = os.path.splitext(filename)[0]
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    new_name = f"{instance.user.id}_{timestamp}_{real_name}_{ext}"
    return f"files/{new_name}"
