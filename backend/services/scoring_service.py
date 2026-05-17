def compute_score(uom_type: str, target: float, actual: float) -> float:
    if actual is None:
        return 0.0

    if uom_type == "min":
        if target == 0:
            return 100.0 if actual > 0 else 0.0
        return min(100.0, max(0.0, (actual / target) * 100.0))
    elif uom_type == "max":
        if actual == 0:
            return 100.0
        if target == 0:
            return 0.0 if actual > 0 else 100.0
        return min(100.0, max(0.0, (target / actual) * 100.0))
    elif uom_type == "timeline":
        return 100.0 if actual <= target else 0.0
    elif uom_type == "zero":
        return 100.0 if actual == 0 else 0.0
    else:
        return 0.0
