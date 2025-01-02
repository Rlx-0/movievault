from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def contact_form(request):
    try:
        logger.info("Received contact form submission")
        data = json.loads(request.body)
        logger.info(f"Form data: {data}")
        
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        # Validate required fields
        if not all([name, email, message]):
            logger.warning("Missing required fields")
            return JsonResponse(
                {'error': 'Please fill in all required fields'}, 
                status=400
            )

        # Render email template
        html_message = render_to_string('emails/contact_form.html', {
            'name': name,
            'email': email,
            'message': message,
            'site_name': 'MovieVault',
            'contact_email': 'alexanderfagerdal01@gmail.com'
        })

        try:
            # Send email
            send_mail(
                subject=f'New Contact Form Message from {name}',
                message=f'Name: {name}\nEmail: {email}\nMessage: {message}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['alexanderfagerdal01@gmail.com'],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info("Email sent successfully")
            return JsonResponse({'status': 'success'})
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
            
    except Exception as e:
        logger.error(f"Contact form error: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to send message. Please try again.'}, 
            status=500
        )