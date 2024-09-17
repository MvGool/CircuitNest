from django import forms
from django_svg_image_form_field import SvgAndImageFormField
import sympy
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.db.models.aggregates import Count
from django.utils.html import format_html, urlencode
from django.urls import reverse
from django.contrib.postgres.fields import ArrayField
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelAdmin
from django.db.models import Q

from . import models
from .custom_forms_admin import LevelAdminForm
from .helper import code_to_dot, generate_code_lines_hidden, refine_code, truth_table_to_boolean_function


class ParticipantInline(admin.TabularInline):
    model = models.Participant
    readonly_fields = ('id', 'final_score')
    classes = ('collapse',)
    extra = 0

    def get_fields(self, request, obj=None):
        if request.user.is_superuser:
            return 'id', 'user', 'scenario', 'level', 'final_score', 'total_time', 'count'
        return 'id', 'user', 'scenario', 'level', 'count'

    def has_delete_permission(self, request, obj=None):
        return False


class ScenarioFilterList(admin.SimpleListFilter):
    title = 'scenario'
    parameter_name = 'scenario'

    def lookups(self, request, model_admin):
        scenarios = models.Scenario.objects.all()
        if not request.user.is_superuser:
            scenarios = scenarios.filter(creator_id=request.user.id)
        return ((scenario.id, scenario.__str__) for scenario in scenarios)

    def queryset(self, request, queryset):
        return queryset.filter(scenario_id=self.value()) if self.value() else queryset


class ClassroomListFilter(admin.SimpleListFilter):
    title = 'classroom'
    parameter_name = 'classroom'

    def lookups(self, request, model_admin):
        classrooms = models.Classroom.objects.all()
        if not request.user.is_superuser:
            classrooms = classrooms.filter(owner_id=request.user.id)
        return ((classroom.id, classroom.name) for classroom in classrooms)

    def queryset(self, request, queryset):
        return queryset.filter(class_related=self.value()) if self.value() else queryset


class LevelFilterList(admin.SimpleListFilter):
    title = 'level'
    parameter_name = 'level'

    def lookups(self, request, model_admin):
        levels = models.Level.objects.all()
        if not request.user.is_superuser:
            levels = levels.filter(creator_id=request.user.id)
        return ((level.id, level.title) for level in levels)

    def queryset(self, request, queryset):
        return queryset.filter(level_id=self.value()) if self.value() else queryset


class LevelInline(admin.TabularInline):
    model = models.Level
    readonly_fields = ('id',)
    classes = ('collapse',)
    extra = 0


@admin.register(models.User)
class UserAdmin(BaseUserAdmin):
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "password1", "password2", "email", "first_name", "last_name",
                           "class_related", "language"),
            },
        ),
    )

    fieldsets = (
        (None,
         {
             "fields": (
                 "first_name", "last_name", "username", "email", "class_related", "tutorial", "language")
         }
         ),
        (
            "Permissions", {
                "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")
            }
        ),
    )

    list_display = ["id", "first_name", "last_name", "username", "email", "class_related", "tutorial"]


@admin.register(models.Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    search_fields = ['name', 'class_related']
    list_display = ['id', 'name', 'description', 'creator_title', 'classroom_detail', 'active']
    fields = ('name', 'description', 'prerequisites', 'class_related', 'active')
    inlines = [ParticipantInline, LevelInline]
    list_filter = (ClassroomListFilter,)

    def get_fields(self, request, obj=None):
        fields = super(ScenarioAdmin, self).get_fields(request, obj)
        if request.user.is_superuser:
            fields += ('creator',)
        return fields

    def classroom_detail(self, scenario):
        if scenario.class_related:
            return scenario.class_related.name
        return ''

    def creator_title(self, scenario):
        if scenario.creator:
            return scenario.creator.first_name + ' ' + scenario.creator.last_name
        return ''

    def save_model(self, request, obj, form, change):
        obj.creator = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        qs = qs.filter(creator_id=request.user.id)
        return qs

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'scenario':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Scenario.objects.filter(
                    creator_id=request.user.id)
        elif db_field.name == 'level':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Level.objects.filter(
                    creator_id=request.user.id)
        elif db_field.name == 'class_related':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Classroom.objects.filter(
                    owner_id=request.user.id)
        # TODO: here we should select only users that are related to a specific lecturer
        return super().formfield_for_foreignkey(
            db_field, request, **kwargs)


@admin.register(models.Level)
class LevelAdmin(PolymorphicParentModelAdmin):
    search_fields = ['title']
    list_display = ['id', 'title', 'number', 'description', 'scenario_title', 'creator_title', 'active']
    fields = (
        'title', 'number', 'description', 'scenario', 'active', 'prerequisites')
    inlines = [ParticipantInline]
    list_filter = (ScenarioFilterList,)
    form = LevelAdminForm
    child_models = (models.ExerciseLevel, models.InformationLevel)

    def get_fields(self, request, obj=None):
        fields = super(LevelAdmin, self).get_fields(request, obj)
        if request.user.is_superuser:
            fields += ('creator',)
        return fields

    def creator_title(self, level):
        if level.creator:
            return level.creator.first_name + ' ' + level.creator.last_name
        return ''

    def scenario_title(self, level):
        return level.scenario.name

    def save_model(self, request, obj, form, change):
        if not obj.creator:
            obj.creator = request.user

        unique_filename, dot_content = code_to_dot(obj.code)
        obj.graphical_image = unique_filename
        obj.graph_dot = dot_content

        if obj.boolean_function == '':
            # generate boolean function
            expressions = truth_table_to_boolean_function(obj.truth_table, obj.inputs, obj.outputs)
            obj.boolean_function = '\n'.join(expressions)

        obj.code = refine_code(obj.code)

        if len(obj.code_lines) == 0:
            obj.code_lines = generate_code_lines_hidden(obj.code)

        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        qs = qs.filter(scenario__class_related__owner_id=request.user.id)
        return qs

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'scenario':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Scenario.objects.filter(
                    creator_id=request.user.id)
        elif db_field.name == 'level':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Level.objects.filter(
                    creator_id=request.user.id)
        # TODO: here we should select only users that are related to a specific lecturer
        return super().formfield_for_foreignkey(
            db_field, request, **kwargs)


@admin.register(models.ExerciseLevel)
class ExerciseLevelAdmin(PolymorphicChildModelAdmin):
    base_model = models.ExerciseLevel
    list_display = ['id', 'title', 'number', 'description', 'scenario_title', 'challenge', 'active']

    def scenario_title(self, level):
        return level.scenario.name


@admin.register(models.InformationLevel)
class InformationLevelAdmin(PolymorphicChildModelAdmin):
    base_model = models.InformationLevel
    list_display = ['id', 'title', 'number', 'description', 'scenario_title', 'active']

    def scenario_title(self, level):
        return level.scenario.name


@admin.register(models.Participant)
class ParticipantAdmin(admin.ModelAdmin):
    # search_fields = ['user_title']
    list_display = ['id', 'user_title', 'scenario_title', 'level_title', 'final_score', 'total_time', 'count']
    fields = ('user', 'scenario', 'level', 'final_score', 'total_time', 'count')
    list_filter = (ClassroomListFilter, ScenarioFilterList, LevelFilterList,)

    def get_list_display(self, request):
        if request.user.is_superuser:
            return ['id', 'user_title', 'scenario_title', 'level_title', 'final_score', 'total_time', 'count']
        return ['id', 'user_title', 'scenario_title', 'level_title', 'count']

    def user_title(self, participant):
        if participant.user:
            return participant.user.first_name + ' ' + participant.user.last_name
        return ''

    def scenario_title(self, participant):
        return participant.scenario.name

    def level_title(self, participant):
        return participant.level.title

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        qs = qs.filter(scenario__creator_id=request.user.id)
        return qs

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'scenario':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Scenario.objects.filter(
                    creator_id=request.user.id)
        elif db_field.name == 'level':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Level.objects.filter(
                    creator_id=request.user.id)
        # TODO: here we should select only users that are related to a specific lecturer
        return super().formfield_for_foreignkey(
            db_field, request, **kwargs)


@admin.register(models.Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'owner_title', 'gamified', 'active', 'scenario_count', 'user_count']

    def get_fields(self, request, obj=None):
        if request.user.is_superuser:
            return ['name', 'description', 'owner', 'code', 'gamified', 'active']
        return ['name', 'description', 'code', 'gamified', 'active']

    def save_model(self, request, obj, form, change):
        obj.owner = request.user
        super().save_model(request, obj, form, change)

    # TODO: here should filter users that are participating in the scenario and filter important information if necessary
    @admin.display(ordering='scenario_count')
    def scenario_count(self, classroom):
        url = (
            reverse('admin:api_scenario_changelist')
            + '?'
            + urlencode({
                'class_related__id': str(classroom.id)
            })
        )
        return format_html('<a href="{}">{} Scenarios</a>', url, classroom.scenario_count)

    @admin.display(ordering='user_count')
    def user_count(self, classroom):
        url = (
            reverse('admin:api_user_changelist')
            + '?'
            + urlencode({
                'class_related__id': str(classroom.id)
            })
        )
        return format_html('<a href="{}">{} Users</a>', url, classroom.user_count)

    def owner_title(self, classroom):
        return classroom.owner.first_name + ' ' + classroom.owner.last_name

    def get_queryset(self, request):
        queryset = super().get_queryset(request).annotate(
            scenario_count=Count('scenarios'),
            user_count=Count('users'),
        )
        if not request.user.is_superuser:
            queryset = queryset.filter(owner_id=request.user.id)
        return queryset
    # TODO: ACTIVE and DEACTIVATE the classroom should active and deactivate the scenarios
    # TODO: Add own admin to the


@admin.register(models.Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ['user_title', 'scenario', 'level', 'level_number', 'stars', 'time', 'star_details', 'completions', 'submissions']
    fields = ('user', 'scenario', 'level', 'stars', 'time', 'star_details', 'completions', 'submissions')
    search_fields = ['user_title']
    list_filter = (ScenarioFilterList, LevelFilterList,)

    def user_title(self, progress):
        if progress.user:
            return progress.user.first_name + ' ' + progress.user.last_name
        return ''

    def level_number(self, progress):
        return progress.level.number

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'scenario':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Scenario.objects.filter(
                    creator_id=request.user.id)
        elif db_field.name == 'level':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Level.objects.filter(
                    creator_id=request.user.id)
        return super().formfield_for_foreignkey(
            db_field, request, **kwargs)


@admin.register(models.ScenarioProgress)
class ScenarioProgressAdmin(admin.ModelAdmin):
    list_display = ['user_title', 'scenario']
    fields = ('user', 'scenario')
    search_fields = ['user_title']
    list_filter = (ScenarioFilterList, )

    def user_title(self, progress):
        if progress.user:
            return progress.user.first_name + ' ' + progress.user.last_name
        return ''

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'scenario':
            if not request.user.is_superuser:
                kwargs["queryset"] = models.Scenario.objects.filter(
                    creator_id=request.user.id)
        return super().formfield_for_foreignkey(
            db_field, request, **kwargs)


@admin.register(models.Avatar)
class Avatar(admin.ModelAdmin):
    list_display = ['id', 'owner_name']

    def owner_name(self, avatar):
        if avatar.user:
            return avatar.user.username
        return ''


class CosmeticForm(forms.ModelForm):
    class Meta:
        model = models.Cosmetic
        exclude = []
        field_classes = {
            'visual': SvgAndImageFormField,
        }


@admin.register(models.Cosmetic)
class Cosmetic(admin.ModelAdmin):
    list_display = ['id', 'name', 'slot', 'visual']
    form = CosmeticForm


@admin.register(models.AvatarCosmetic)
class AvatarCosmetic(admin.ModelAdmin):
    list_display = ['owner_name', 'cosmetic_name', 'unlocked', 'equipped']

    def owner_name(self, avatar_cosmetic):
        if avatar_cosmetic.avatar.user:
            return avatar_cosmetic.avatar.user.username
        return ''

    def cosmetic_name(self, avatar_cosmetic):
        if avatar_cosmetic.cosmetic.name:
            return avatar_cosmetic.cosmetic.name
        return ''


class AchievementVisualForm(forms.ModelForm):
    class Meta:
        model = models.AchievementVisual
        exclude = []
        field_classes = {
            'visual': SvgAndImageFormField,
        }


@admin.register(models.AchievementVisual)
class AchievementVisual(admin.ModelAdmin):
    list_display = ['id', 'name', 'visual']
    form = AchievementVisualForm


class AchievementForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(AchievementForm, self).__init__(*args, **kwargs)
        self.fields['condition'].queryset = models.AchievementCondition.objects.filter(Q(achievement=None) | Q(achievement=self.instance))


@admin.register(models.Achievement)
class Achievement(admin.ModelAdmin):
    list_display = ['id', 'name', 'description', 'hint', 'condition', 'reward', 'visual']
    form = AchievementForm
    list_filter = (ClassroomListFilter,)


@admin.register(models.AchievementCondition)
class AchievementCondition(admin.ModelAdmin):
    list_display = ['achievement_name', 'condition_type', 'value']

    def achievement_name(self, achievement_condition):
        if achievement_condition.achievement:
            return achievement_condition.achievement.name
        return ''

    def value(self, achievement_condition):
        if achievement_condition.condition_type == models.AchievementCondition.AchievementConditionType.LEVEL_COMPLETION:
            return achievement_condition.level
        if achievement_condition.condition_type == models.AchievementCondition.AchievementConditionType.SCENARIO_COMPLETION:
            return achievement_condition.scenario
        if achievement_condition.condition_type == models.AchievementCondition.AchievementConditionType.STAR_COLLECTION:
            return achievement_condition.stars
        return ''


@admin.register(models.UserAchievement)
class UserAchievement(admin.ModelAdmin):
    list_display = ['user_name', 'achievement_name', 'achievement_classroom', 'unlocked_at']

    def user_name(self, user_achievement):
        if user_achievement.user:
            return user_achievement.user.first_name + ' ' + user_achievement.user.last_name
        return ''

    def achievement_name(self, user_achievement):
        if user_achievement.achievement.name:
            return user_achievement.achievement.name
        return ''

    def achievement_classroom(self, user_achievement):
        if user_achievement.achievement.class_related:
            return user_achievement.achievement.class_related.name
        return ''


class VisualForm(forms.ModelForm):
    class Meta:
        model = models.Visual
        exclude = []
        field_classes = {
            'visual': SvgAndImageFormField,
        }


@admin.register(models.Visual)
class Visual(admin.ModelAdmin):
    list_display = ['id', 'name', 'visual']
    form = VisualForm
