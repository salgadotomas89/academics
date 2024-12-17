from django.contrib import admin
from .models import Person

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('person_id', 'first_name', 'last_name', 'user')
    search_fields = ('first_name', 'last_name', 'user__username')
