import csv

# Filenames
author_info_with_country_filename = 'author_info_with_country.csv'
geolocation_filename = 'geolocation.csv'
output_filename = 'author_info_with_geo.csv'

# Read geolocation into a dictionary for faster lookup
geolocations = {}
with open(geolocation_filename, mode='r', newline='', encoding='utf-8') as infile:
    reader = csv.reader(infile)
    next(reader)  # Skip header
    for row in reader:
        institution, latitude, longitude = row[0].strip().lower(), row[1], row[2]
        geolocations[institution] = (latitude, longitude)

# Process author info and add latitude, longitude
with open(author_info_with_country_filename, mode='r', newline='', encoding='utf-8') as infile, \
     open(output_filename, mode='w', newline='', encoding='utf-8') as outfile:

    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    # Write header to output file
    header = next(reader)
    header.extend(['latitude', 'longitude'])
    writer.writerow(header)

    # Check 'dept' field, and write row with added 'latitude' and 'longitude'
    for row in reader:
        dept = row[1].strip().lower()  # assuming 'dept' is in the second column
        # Check if dept is in geolocations, and set latitude, longitude accordingly
        latitude, longitude = geolocations.get(dept, ('NA', 'NA'))
        # Add latitude, longitude to row and write to output file
        row.extend([latitude, longitude])
        writer.writerow(row)
