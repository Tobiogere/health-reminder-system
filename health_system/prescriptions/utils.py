from django.utils import timezone
from schedules.models import DoseLog


def update_prescription_status(prescription):

    logs = DoseLog.objects.filter(schedule__prescription=prescription)

    if not logs.exists():
        prescription.status = "pending"
        prescription.save()
        return

    total = logs.count()
    taken = logs.filter(status="taken").count()

    # check overdue doses
    now = timezone.now()
    missed = logs.filter(status="pending", scheduled_time__lt=now).count()

    # ALL TAKEN
    if taken == total:
        prescription.status = "completed"

    # ALL MISSED (everything overdue and not taken)
    elif missed == total:
        prescription.status = "missed"

    # SOME ACTION DONE
    elif taken > 0:
        prescription.status = "active"

    # NOTHING DONE YET BUT STILL TIME LEFT
    else:
        prescription.status = "pending"

    prescription.save()