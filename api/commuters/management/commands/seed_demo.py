from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker

from commuters.models import (
    Employee,
    CommuteOption,
    Enrollment,
    CommuteSession,
    Office,
    HRProfile,
    Reward,
)


class Command(BaseCommand):
    help = "Seed the database with demo Fleet data"

    def handle(self, *args, **options):
        fake = Faker()
        User = get_user_model()

        # Clear existing demo data so this command is safe to run multiple times
        self.stdout.write("Clearing existing demo data...")
        CommuteSession.objects.all().delete()
        Enrollment.objects.all().delete()
        Employee.objects.all().delete()
        HRProfile.objects.all().delete()
        Reward.objects.all().delete()
        Office.objects.all().delete()

        self.stdout.write("Creating demo office and HR user...")
        office, hr_user = self._create_office_and_hr(User)

        self.stdout.write("Creating demo commute options...")
        options = self._create_options()

        self.stdout.write("Creating demo rewards...")
        self._create_rewards(office)

        self.stdout.write("Creating primary demo employee user...")
        demo_employee = self._create_demo_employee(User, office, options)

        self.stdout.write("Creating additional demo employees, enrollments, and sessions...")
        self._create_extra_employees(fake, User, office, options)

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded demo office, HR, employees, options, rewards, enrollments, and sessions."
            )
        )

    # ---- helpers ----------------------------------------------------

    def _create_office_and_hr(self, User):
        hr_username = "hr_demo"
        hr_email = "hr@fleetdemo.com"

        hr_user, created = User.objects.get_or_create(
            username=hr_username,
            defaults={
                "email": hr_email,
                "is_staff": True,
            },
        )
        if created:
            hr_user.set_password("password123")
            hr_user.save()

        office, _ = Office.objects.get_or_create(
            name="Fleet Toronto HQ",
            defaults={
                "city": "Toronto",
                "address": "123 Demo Street",
                "monthly_budget": Decimal("5000.00"),
                "baseline_monthly_cost": Decimal("300.00"),
                "baseline_co2_kg_per_month": Decimal("220.0"),
                "payroll_tax_rate": Decimal("7.65"),
            },
        )

        HRProfile.objects.get_or_create(user=hr_user, office=office)

        return office, hr_user

    def _create_options(self):
        """
        Create commuting options with some rough demo numbers.
        Values are per month and totally made up, just to look plausible.
        """
        data = [
            (
                "Drive Alone",
                "Drive your own car to the office.",
                320,  # before tax
                320,  # after tax (no benefit)
                220,  # kg CO2 / month
                15,   # points_per_session
            ),
            (
                "Go Train",
                "Take the regional GO Train.",
                260,
                200,
                160,
                30,
            ),
            (
                "TTC",
                "Toronto Transit Commission – subway/streetcar/bus.",
                220,
                180,
                150,
                25,
            ),
            (
                "Bike",
                "Bike to the office.",
                50,
                0,
                10,
                40,
            ),
            (
                "Carpool",
                "Share a ride with coworkers.",
                180,
                160,
                120,
                30,
            ),
            (
                "Walking",
                "Walk all or part of the way.",
                0,
                0,
                0,
                45,
            ),
        ]

        options = []
        for name, description, before, after, co2, points in data:
            opt, _ = CommuteOption.objects.get_or_create(
                name=name,
                defaults={
                    "description": description,
                    "active": True,
                    "monthly_cost_before_tax": before,
                    "monthly_cost_after_tax": after,
                    "co2_kg_per_month": co2,
                    "points_per_session": points,
                },
            )
            options.append(opt)
        return options

    def _create_rewards(self, office):
        rewards_data = [
            ("Free Coffee Card", "individual", 150),
            ("Team Pizza Friday", "team", 800),
            ("Leave Early Friday", "team", 1200),
        ]

        for name, type_, target in rewards_data:
            Reward.objects.get_or_create(
                office=office,
                name=name,
                type=type_,
                defaults={
                    "description": "",
                    "target_points": target,
                },
            )

    def _create_demo_employee(self, User, office, options):
        username = "employee_demo"
        email = "employee@fleetdemo.com"

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email},
        )
        if created:
            user.set_password("password123")
            user.save()

        employee, _ = Employee.objects.get_or_create(
            email=email,
            defaults={
                "user": user,
                "name": "Demo Employee",
                "department": "Engineering",
                "status": "active",
                "office": office,
                "home_postal_code": "M5V 2T6",
            },
        )

        # Make this employee use a nice sustainable option by default
        preferred = next((o for o in options if o.name in ["Go Train", "Bike"]), options[0])
        employee.preferred_option = preferred
        employee.save(update_fields=["preferred_option"])

        # Give them a few completed sessions
        for _ in range(5):
            CommuteSession.objects.create(
                employee=employee,
                status="completed",
                points_earned=preferred.points_per_session,
            )

        return employee

    def _create_extra_employees(self, fake, User, office, options):
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
                    "office": office,
                    "home_postal_code": fake.postalcode(),
                },
            )

            # 3) pick a preferred option
            preferred = random.choice(options)
            employee.preferred_option = preferred
            employee.save(update_fields=["preferred_option"])

            # 4) 1–3 active enrollments in different options
            enrolled_options = random.sample(options, k=random.randint(1, min(3, len(options))))
            for opt in enrolled_options:
                Enrollment.objects.get_or_create(
                    employee=employee,
                    option=opt,
                    status="active",
                )

            # 5) 0–3 completed commute sessions
            for _ in range(random.randint(0, 3)):
                CommuteSession.objects.create(
                    employee=employee,
                    status="completed",
                    points_earned=random.choice([10, 20, 30, 40]),
                )
