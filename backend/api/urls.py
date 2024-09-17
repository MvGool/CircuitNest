from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_nested import routers
import api.views as views
from . import custom_forget_password_view

router = routers.DefaultRouter()
router.register('scenarios', views.ScenarioViewSet, basename='scenarios')
router.register('participants', views.ParticipantViewSet, basename='participants')
router.register('classrooms', views.ClassroomViewSet, basename='classrooms')
router.register('achievements', views.AchievementViewSet, basename='achievements')
router.register('user-achievements', views.UserAchievementViewSet, basename='user-achievements')
router.register('avatars', views.AvatarViewSet, basename='avatars')
router.register('cosmetics', views.CosmeticViewSet, basename='cosmetics')
router.register('avatar-cosmetics', views.AvatarCosmeticViewSet, basename='avatar-cosmetics')
router.register('progress', views.ScenarioProgressViewSet, basename='progress')

levels_router = routers.NestedDefaultRouter(router, 'scenarios', lookup='scenario')
levels_router.register('levels', views.LevelViewSet, basename='scenario-levels')
levels_router.register('progress', views.ProgressViewSet, basename='scenario-progress')

urlpatterns = [
    path('auth/user/leaderboard/', views.CustomUserLeaderboard.as_view(), name='leaderboard'),
    path('answer/submit/', views.SubmitAnswerLevel.as_view(), name='answer'),
    path('answer/complete-information/', views.CompleteInformationLevel.as_view(), name='complete-information'),
    path('custom/add/level/', views.SubmitLevelJSON.as_view(), name='add-level-json'),
    path('custom/add/achievement/', views.MassCreateAchievements.as_view(), name='add-achievement-json'),
    path('information-guide/', views.InformationGuideView.as_view(), name='information-guide'),
    path('tutorial/', views.TutorialView.as_view(), name='tutorial'),
    path('user-language/', views.UserLanguageView.as_view(), name='user-language'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('password/reset/<str:uid>/<str:token>/', custom_forget_password_view.reset_user_password,
         name='reset_user_password'),
]
urlpatterns += router.urls + levels_router.urls
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
