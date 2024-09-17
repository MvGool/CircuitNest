from django import forms
from django.core.exceptions import ValidationError
from django.contrib.postgres.forms import SimpleArrayField
from . import models


class LevelAdminForm(forms.ModelForm):
    # Show error on index field

    truth_table = SimpleArrayField(SimpleArrayField(forms.BooleanField(required=False)), delimiter="|")

    def clean_number(self):
        scenario = self.cleaned_data.get("scenario")
        new_number = self.cleaned_data.get("number")

        levels = models.Level.objects.filter(scenario=scenario).order_by(
            'number')

        if self.instance.pk:
            levels = levels.exclude(pk=self.instance.pk)

        # convert to python list
        levels_number = list(level.number for level in levels)

        levels_number.append(new_number)

        # arrange ordering one more time
        levels_number.sort()

        # Check if the indexing values are consecutive
        expected_number = 0
        for item in levels_number:
            if item != expected_number:
                # Handle the case where indexing is not consecutive (a mess)
                raise ValidationError(
                    "number is illegal ( the first level should start with 0, there should not be any gap between numbers and a duplicated number is not allowed.)")
            expected_number += 1

        return self.cleaned_data["number"]
