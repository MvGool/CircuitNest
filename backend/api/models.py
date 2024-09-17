import uuid
from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django_jsonform.models.fields import ArrayField as DynamicArrayField
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from polymorphic.models import PolymorphicModel
from smart_selects.db_fields import ChainedManyToManyField, ChainedForeignKey


class Classroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField()
    active = models.BooleanField(default=True)
    gamified = models.BooleanField(default=True)

    # scenarios
    # users

    def __str__(self) -> str:
        return self.name


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # email = models.EmailField(unique=True)
    email = models.EmailField(null=True, blank=True)
    class_related = models.ForeignKey(Classroom, null=True, blank=True, on_delete=models.SET_NULL, related_name='users')
    tutorial = models.PositiveIntegerField(default=0)
    language = models.CharField(max_length=255, default='en')

    def __str__(self) -> str:
        return self.username


class Scenario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False)
    creator = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    class_related = models.ForeignKey(Classroom, null=True, blank=True, on_delete=models.SET_NULL,
                                      related_name='scenarios')
    active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"{self.name} - {self.class_related.name}"


class Level(PolymorphicModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    number = models.PositiveIntegerField()
    scenario = models.ForeignKey(Scenario, null=True, blank=True, on_delete=models.CASCADE)
    creator = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    active = models.BooleanField(default=True)
    prerequisites = ChainedManyToManyField(
        'self',
        blank=True,
        symmetrical=False,
        horizontal=True,
        verbose_name='Prerequisites',
        chained_field='scenario',
        chained_model_field='scenario'
    )

    def __str__(self) -> str:
        return self.title


class ExerciseLevel(Level):
    start_type = models.CharField(max_length=255)
    end_type = models.CharField(max_length=255)
    challenge = models.BooleanField(default=False)
    gates = ArrayField(models.CharField(max_length=255), blank=True)
    inputs = ArrayField(models.CharField(max_length=255))
    outputs = ArrayField(models.CharField(max_length=255))
    truth_table = DynamicArrayField(ArrayField(models.BooleanField()))
    boolean_function = models.TextField(blank=True)
    graphical = models.JSONField()
    code = models.TextField()
    time_goal = models.PositiveIntegerField()


class InformationLevel(Level):
    content = models.TextField()
    guides = DynamicArrayField(models.JSONField(), null=True, blank=True)


class Participant(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    final_score = models.PositiveIntegerField(null=True, blank=True)
    total_time = models.PositiveIntegerField(null=True, blank=True)
    count = models.PositiveIntegerField(default=0)
    error_count = models.PositiveIntegerField(default=0)
    class_related = models.ForeignKey(Classroom, null=True, blank=True, on_delete=models.SET_NULL)
    input_types = ArrayField(models.CharField(max_length=255), blank=True)
    output_types = ArrayField(models.CharField(max_length=255), blank=True)

    def __str__(self) -> str:
        return self.user.first_name + ' ' + self.user.last_name + ' - ' + self.scenario.name


class Progress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    level = ChainedForeignKey(
        Level,
        on_delete=models.CASCADE,
        verbose_name='Level',
        chained_field='scenario',
        chained_model_field='scenario'
    )
    stars = models.PositiveIntegerField(blank=True, null=True)
    time = models.PositiveIntegerField(blank=True, null=True)
    star_details = ArrayField(models.BooleanField(), blank=True, null=True)
    completions = models.PositiveIntegerField(default=0)
    submissions = models.PositiveIntegerField(default=0)


class ScenarioProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)


class Avatar(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    color_palette = models.JSONField(null=True, blank=True)

    def __str__(self) -> str:
        return self.user.first_name + ' ' + self.user.last_name


# Create an avatar for each user
@receiver(post_save, sender=User)
def create_avatar(sender, instance, created, **kwargs):
    if created:
        if not hasattr(instance, 'avatar'):
            Avatar.objects.create(user=instance)


class Cosmetic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slot = models.CharField(max_length=255)
    visual = models.ImageField(upload_to='visuals/cosmetics/', null=True, blank=True)

    def __str__(self) -> str:
        return self.name


class AvatarCosmetic(models.Model):
    avatar = models.ForeignKey(Avatar, on_delete=models.CASCADE)
    cosmetic = models.ForeignKey(Cosmetic, on_delete=models.CASCADE)
    unlocked = models.BooleanField(default=False)
    equipped = models.BooleanField(default=False)


class AchievementCondition(models.Model):
    class AchievementConditionType(models.IntegerChoices):
        LEVEL_COMPLETION = 1
        LEVEL_RETRY = 2
        SCENARIO_COMPLETION = 3
        STAR_COLLECTION = 4
        LEADERBOARD_POSITION = 5
        ALL_ACHIEVEMENTS = 6
        TUTORIAL_COMPLETION = 7
        COSMETICS_EQUIPPED = 8

    condition_type = models.PositiveSmallIntegerField(choices=AchievementConditionType.choices)
    level = models.ForeignKey(Level, null=True, blank=True, on_delete=models.SET_NULL)
    scenario = models.ForeignKey(Scenario, null=True, blank=True, on_delete=models.SET_NULL)
    stars = models.PositiveIntegerField(null=True, blank=True)
    perfection_required = models.BooleanField(default=False)
    leaderboard_position = models.PositiveIntegerField(null=True, blank=True)
    cosmetics_equipped = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self) -> str:
        if self.condition_type == self.AchievementConditionType.LEVEL_COMPLETION:
            return f'Level completion: {self.level}{"" if not self.perfection_required else " (perfection required)"}'
        elif self.condition_type == self.AchievementConditionType.SCENARIO_COMPLETION:
            return f'Scenario completion: {self.scenario}{"" if not self.perfection_required else " (perfection required)"}'
        elif self.condition_type == self.AchievementConditionType.STAR_COLLECTION:
            return f'Star collection: {self.stars}'
        elif self.condition_type == self.AchievementConditionType.LEADERBOARD_POSITION:
            return f'Leaderboard position: {self.leaderboard_position}'
        elif self.condition_type == self.AchievementConditionType.COSMETICS_EQUIPPED:
            return f'Cosmetics equipped: {self.cosmetics_equipped}'
        else:
            return self.AchievementConditionType(self.condition_type).label


class AchievementVisual(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    visual = models.ImageField(upload_to='visuals/achievements/')

    def __str__(self) -> str:
        return self.name


class Achievement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    hint = models.TextField()
    class_related = models.ForeignKey(Classroom, null=True, blank=True, on_delete=models.SET_NULL)
    condition = models.OneToOneField(AchievementCondition, null=True, blank=True, on_delete=models.SET_NULL)
    visual = models.ForeignKey(AchievementVisual, null=True, blank=True, on_delete=models.SET_NULL)
    reward = models.ForeignKey(Cosmetic, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self) -> str:
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)


class Visual(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    visual = models.ImageField(upload_to='visuals/')

    def __str__(self) -> str:
        return self.name
