import requests
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import render
from rest_framework.decorators import (api_view, permission_classes,
                                       renderer_classes)
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.utils import json
from django.conf import settings


@api_view(('GET', 'POST'))
@renderer_classes((TemplateHTMLRenderer, JSONRenderer))
@permission_classes([AllowAny])
def reset_user_password(request, **kwargs):
    # uses djoser to reset password
    if request.POST:
        current_site = settings.BACKEND_CUSTOM_URL
        # names of the inputs in the password reset form
        password = request.POST.get('new_password')
        print(password)
        password_confirmation = request.POST.get('confirm_password')
        print(password_confirmation)
        # data to accept. the uid and token is obtained as keyword arguments in the url
        payload = {
            'uid': kwargs.get('uid'),
            'token': kwargs.get('token'),
            'new_password': password,
            're_new_password': password_confirmation
        }

        djoser_password_reset_url = 'v1/auth/users/reset_password_confirm/'
        protocol = 'https'
        headers = {'content-Type': 'application/json'}
        if bool(request) and not request.is_secure():
            protocol = 'http'
        url = '{0}://{1}/{2}'.format(protocol, current_site,
                                     djoser_password_reset_url)
        response = requests.post(url,
                                 data=json.dumps(payload),
                                 headers=headers)

        if response.status_code == 204:
            # Give some feedback to the user.
            messages.success(request,
                             'Your password has been reset successfully!')
            return HttpResponseRedirect(settings.FRONTEND_CUSTOM_URL)
        else:
            response_object = response.json()
            response_object_keys = response_object.keys()
            # catch any errors
            for key in response_object_keys:
                decoded_string = response_object.get(key)[0].replace("'", "\'")
                messages.error(request, f'{decoded_string}')
            return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
        # if the request method is a GET request, provide the template to show. in most cases, the password reset form.
    else:
        return render(request, 'reset_password.html')
