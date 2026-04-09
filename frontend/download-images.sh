#!/bin/bash

# Script to download shop item images from Unsplash
# Each category has specific image dimensions

echo "Downloading shop item images from Unsplash..."

# Create directories
mkdir -p public/images/{clothing,accessories,cars,houses}

# CLOTHING - Common (200x200)
echo "Downloading clothing - common items..."
curl -L "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop" -o "public/images/clothing/plain-tshirt.jpg"
curl -L "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop" -o "public/images/clothing/casual-jeans.jpg"
curl -L "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=200&h=200&fit=crop" -o "public/images/clothing/sneakers.jpg"
curl -L "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop" -o "public/images/clothing/hoodie.jpg"
curl -L "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop" -o "public/images/clothing/designer-shirt.jpg"

# CLOTHING - Rare (200x200)
echo "Downloading clothing - rare items..."
curl -L "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop" -o "public/images/clothing/leather-jacket.jpg"
curl -L "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop" -o "public/images/clothing/designer-dress.jpg"
curl -L "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop" -o "public/images/clothing/business-suit.jpg"
curl -L "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200&h=200&fit=crop" -o "public/images/clothing/evening-gown.jpg"
curl -L "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=200&h=200&fit=crop" -o "public/images/clothing/tuxedo.jpg"
curl -L "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=200&h=200&fit=crop" -o "public/images/clothing/designer-coat.jpg"

# CLOTHING - Epic (200x200)
echo "Downloading clothing - epic items..."
curl -L "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop" -o "public/images/clothing/custom-suit.jpg"
curl -L "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop" -o "public/images/clothing/haute-couture.jpg"
curl -L "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop" -o "public/images/clothing/fur-coat.jpg"

# CLOTHING - Legendary (200x200)
echo "Downloading clothing - legendary items..."
curl -L "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop" -o "public/images/clothing/limited-edition.jpg"

# ACCESSORIES - Common (200x200)
echo "Downloading accessories - common items..."
curl -L "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop" -o "public/images/accessories/sunglasses.jpg"
curl -L "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&h=200&fit=crop" -o "public/images/accessories/wallet.jpg"
curl -L "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" -o "public/images/accessories/casual-watch.jpg"
curl -L "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=200&h=200&fit=crop" -o "public/images/accessories/belt.jpg"
curl -L "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop" -o "public/images/accessories/backpack.jpg"

# ACCESSORIES - Rare (200x200)
echo "Downloading accessories - rare items..."
curl -L "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop" -o "public/images/accessories/designer-handbag.jpg"
curl -L "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop" -o "public/images/accessories/gold-necklace.jpg"
curl -L "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop" -o "public/images/accessories/briefcase.jpg"
curl -L "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop" -o "public/images/accessories/pearl-earrings.jpg"
curl -L "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop" -o "public/images/accessories/silver-bracelet.jpg"
curl -L "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=200&h=200&fit=crop" -o "public/images/accessories/luxury-watch.jpg"

# ACCESSORIES - Epic (200x200)
echo "Downloading accessories - epic items..."
curl -L "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop" -o "public/images/accessories/diamond-ring.jpg"
curl -L "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=200&h=200&fit=crop" -o "public/images/accessories/cufflinks.jpg"

# ACCESSORIES - Legendary (200x200)
echo "Downloading accessories - legendary items..."
curl -L "https://images.unsplash.com/photo-1587836374028-4b90360abfef?w=200&h=200&fit=crop" -o "public/images/accessories/collectible-watch.jpg"
curl -L "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop" -o "public/images/accessories/diamond-set.jpg"

# CARS - Common (300x200)
echo "Downloading cars - common items..."
curl -L "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop" -o "public/images/cars/old-sedan.jpg"
curl -L "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop" -o "public/images/cars/compact-car.jpg"

# CARS - Rare (300x200)
echo "Downloading cars - rare items..."
curl -L "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=300&h=200&fit=crop" -o "public/images/cars/family-sedan.jpg"
curl -L "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=300&h=200&fit=crop" -o "public/images/cars/used-suv.jpg"
curl -L "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&h=200&fit=crop" -o "public/images/cars/new-suv.jpg"
curl -L "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=200&fit=crop" -o "public/images/cars/sports-coupe.jpg"

# CARS - Epic (300x200)
echo "Downloading cars - epic items..."
curl -L "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&h=200&fit=crop" -o "public/images/cars/electric-car.jpg"
curl -L "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=300&h=200&fit=crop" -o "public/images/cars/luxury-sedan.jpg"
curl -L "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&h=200&fit=crop" -o "public/images/cars/tesla-model-s.jpg"

# CARS - Legendary (300x200)
echo "Downloading cars - legendary items..."
curl -L "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=300&h=200&fit=crop" -o "public/images/cars/mercedes-s.jpg"
curl -L "https://images.unsplash.com/photo-1580414057011-c80e8825b922?w=300&h=200&fit=crop" -o "public/images/cars/porsche-911.jpg"
curl -L "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=300&h=200&fit=crop" -o "public/images/cars/ferrari-f8.jpg"
curl -L "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300&h=200&fit=crop" -o "public/images/cars/lamborghini.jpg"

# HOUSES - Common (400x300)
echo "Downloading houses - common items..."
curl -L "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop" -o "public/images/houses/studio-apartment.jpg"
curl -L "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop" -o "public/images/houses/small-apartment.jpg"

# HOUSES - Rare (400x300)
echo "Downloading houses - rare items..."
curl -L "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop" -o "public/images/houses/suburban-house.jpg"
curl -L "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop" -o "public/images/houses/city-condo.jpg"
curl -L "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop" -o "public/images/houses/family-home.jpg"
curl -L "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=300&fit=crop" -o "public/images/houses/lake-house.jpg"

# HOUSES - Epic (400x300)
echo "Downloading houses - epic items..."
curl -L "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=300&fit=crop" -o "public/images/houses/beach-house.jpg"
curl -L "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop" -o "public/images/houses/penthouse.jpg"

# HOUSES - Legendary (400x300)
echo "Downloading houses - legendary items..."
curl -L "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop" -o "public/images/houses/mansion.jpg"
curl -L "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop" -o "public/images/houses/estate.jpg"
curl -L "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=300&fit=crop" -o "public/images/houses/island-villa.jpg"

echo "Download complete! All images saved to public/images/"
