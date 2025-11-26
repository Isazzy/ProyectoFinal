from django.conf import settings
import re

class AllowMediaWithoutAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.media_regex = re.compile(r'^' + re.escape(settings.MEDIA_URL))

    def __call__(self, request):
        # Permitir /media/* sin autenticación
        if self.media_regex.match(request.path):
            request._dont_enforce_csrf_checks = True
            return self.get_response(request)

        return self.get_response(request)
