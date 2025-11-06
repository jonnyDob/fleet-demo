# commuters/management/commands/seed_demo.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
import random

from commuters.models import Employee, CommuteOption, Enrollment, CommuteSession


class Command(BaseCommand):
    help = "Seed the database with demo Fleet data"

    def handle(self, *args, **options):
        fake = Faker()
        User = get_user_model()

        self.stdout.write("Creating demo commute options...")
        options = self._create_options()

        self.stdout.write("Creating demo users, employees, enrollments, and sessions...")
        departments = ["Engineering", "Sales", "Marketing", "HR", "Operations"]

        for i in range(30):
            username = f"commuter{i+1}"
            email = fake.unique.email()

            # 1) Auth user
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email},
            )
            if created:
                user.set_password("password123")
                user.save()

            # 2) Employee linked to user
            employee, _ = Employee.objects.get_or_create(
                email=email,
                defaults={
                    "user": user,
                    "name": fake.name(),
                    "department": random.choice(departments),
                    "status": "active",
                },
            )

            # 3) 1–3 active enrollments in different options
            enrolled_options = random.sample(options, k=random.randint(1, min(3, len(options))))
            for opt in enrolled_options:
                Enrollment.objects.get_or_create(
                    employee=employee,
                    option=opt,
                    status="active",
                )

            # 4) 0–3 completed commute sessions
            for _ in range(random.randint(0, 3)):
                CommuteSession.objects.create(
                    employee=employee,
                    status="completed",
                    points_earned=random.choice([10, 20, 30, 40]),
                )

        self.stdout.write(self.style.SUCCESS("Seeded demo users, employees, options, enrollments, and sessions."))

    def _create_options(self):
        labels = [
            ("Go Train", "Take the regional GO Train."),
            ("TTC", "Toronto Transit Commission – subway/streetcar/bus."),
            ("Bike", "Bike to the office."),
            ("Carpool", "Share a ride with coworkers."),
            ("Walking", "Walk all or part of the way."),
        ]

        options = []
        for name, description in labels:
            opt, _ = CommuteOption.objects.get_or_create(
                name=name,
                defaults={
                    "description": description,
                    "active": True,
                },
            )
            options.append(opt)
        return options
