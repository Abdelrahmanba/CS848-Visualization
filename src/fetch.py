import json
from opencage.geocoder import OpenCageGeocode

# Your API Key from OpenCage
api_key = '790e4db213e1420d91f1ccdc87c70df5'
geocoder = OpenCageGeocode(api_key)

# Read the data from geolocation.json
with open('geolocation.json', 'r') as file:
    data = json.load(file)

# Modified data container
modified_data = {}

# Add state data to each university's data
for university, coordinates in data.items():
    try:
        # Fetching the geocoding result
        result = geocoder.reverse_geocode(coordinates['latitude'], coordinates['longitude'])[0]
        country_code = result['components'].get('country_code', '').upper()
        
        # Check if the country_code is US or CA
        if country_code not in ['US', 'CA']:
            print(f"{university} is located outside the US and Canada. Skipping...")
            continue
        
        # Extracting the state from the geocoding result
        state = result['components'].get('state_code', '')
        
        # Adding state to the data
        modified_data[university] = {
            "latitude": coordinates['latitude'],
            "longitude": coordinates['longitude'],
            "state": state,
            "country_code": country_code,
        }
    except Exception as e:
        print(f"Error fetching data for {university}: {str(e)}")
        modified_data[university] = {
            "latitude": coordinates['latitude'],
            "longitude": coordinates['longitude'],
            "state": "Error"
        }

# Write the updated data back to geolocation_filtered.json
with open('geolocation_filtered.json', 'w') as file:
    json.dump(modified_data, file, indent=4)

# Output the modified JSON
print(json.dumps(modified_data, indent=4))
