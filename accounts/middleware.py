
from django.utils.deprecation import MiddlewareMixin
from django.contrib.sessions.models import Session
import geoip2.database
import os

GEOIP_DB_PATH = os.path.join(os.path.dirname(__file__), 'GeoLite2-City.mmdb')  
class SessionActivityMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.user.is_authenticated:
            session = request.session
            session['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            session['ip_address'] = self.get_client_ip(request)
            session['location'] = self.get_location(session['ip_address'])
            session.save()

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_location(self, ip):
        try:
            with geoip2.database.Reader(GEOIP_DB_PATH) as reader:
                response = reader.city(ip)
                city = response.city.name or ''
                country = response.country.name or ''
                return f"{city}, {country}"
        except Exception:
            return "Unknown"
