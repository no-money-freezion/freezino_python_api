# app/data/items.py
from typing import Any, Dict

ITEM_LIST: Dict[str, Dict[str, Any]] = {
    "Business Suit": {
        "id": 1,
        "cost": 100,
        "status": True,
        "breakable": False,
        "type": "clothing",
        "rarity": "common",
        "description": "Professional office attire",
    },
    "Designer Watch": {
        "id": 2,
        "cost": 110,
        "status": True,
        "breakable": False,
        "type": "accessory",
        "rarity": "rare",
        "description": "Luxury timepiece",
    },
    "Nice house": {
        "id": 3,
        "cost": 120,
        "status": True,
        "breakable": False,
        "type": "house",
        "rarity": "epic",
        "description": "Place to live",
    },
    "Toyota Highlander": {
        "id": 4,
        "cost": 130,
        "status": True,
        "breakable": True,
        "type": "car",
        "rarity": "legendary",
        "description": "Red go faster",
    },
    "Uniform": {
        "id": 4,
        "cost": 130,
        "status": True,
        "breakable": True,
        "type": "clothing",
        "rarity": "epic",
        "description": "Courier Uniform, yes",
    },
}