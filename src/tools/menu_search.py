import json
from pathlib import Path
from typing import List, Optional
from src.models.schemas import MenuItem


# Resolve the default database path relative to this file
DEFAULT_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "mock_menus.json"


def load_menu_database(data_path: Optional[Path] = None) -> List[MenuItem]:
    """Loads and validates the mock menu items from the JSON database."""
    file_path = data_path or DEFAULT_DATA_PATH
    if not file_path.exists():
        raise FileNotFoundError(f"Mock menu database not found at {file_path}")
    
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    return [MenuItem(**item) for item in data]


def local_menu_search(
    query: Optional[str] = None,
    restaurant: Optional[str] = None,
    max_calories: Optional[int] = None,
    min_protein: Optional[int] = None,
    data_path: Optional[Path] = None,
) -> List[MenuItem]:
    """
    Search and filter local restaurant menu items based on nutritional and text constraints.
    
    Args:
        query: Keyword to search within menu item name.
        restaurant: Restaurant/vendor name filter (case-insensitive substring).
        max_calories: Maximum allowable calories per item.
        min_protein: Minimum required protein in grams per item.
        data_path: Optional custom path for the menu JSON dataset.

    Returns:
        List of matching MenuItem instances.
    """
    items = load_menu_database(data_path)
    results = []

    for item in items:
        # Restaurant filter
        if restaurant and restaurant.lower() not in item.restaurant.lower():
            continue
        
        # Query text filter
        if query and query.lower() not in item.name.lower() and query.lower() not in item.restaurant.lower():
            continue
        
        # Calorie ceiling
        if max_calories is not None and item.calories > max_calories:
            continue
        
        # Protein floor
        if min_protein is not None and item.protein_g < min_protein:
            continue

        results.append(item)

    return results


def get_menu_item_by_id(item_id: str, data_path: Optional[Path] = None) -> Optional[MenuItem]:
    """Find a single menu item by its unique ID."""
    items = load_menu_database(data_path)
    for item in items:
        if item.id == item_id:
            return item
    return None
