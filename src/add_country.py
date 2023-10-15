import csv

# Filenames
author_info_filename = 'category-replaced-author-info.csv'
canada_institutions_filename = 'canada_only.csv'
output_filename = 'author_info_with_country.csv'

# Read Canada institutions into a set for faster lookup
canada_institutions = set()
with open(canada_institutions_filename, mode='r', newline='', encoding='utf-8') as infile:
    reader = csv.reader(infile)
    next(reader)  # Skip header
    for row in reader:
        canada_institutions.add(row[0].strip().lower())  # assuming institution is in the first column

# Process author info and add country
with open(author_info_filename, mode='r', newline='', encoding='utf-8') as infile, \
     open(output_filename, mode='w', newline='', encoding='utf-8') as outfile:

    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    # Write header to output file
    header = next(reader)
    header.append('country')
    writer.writerow(header)

    # Check 'dept' field, and write row with added 'country' field
    for row in reader:
        dept = row[1].strip().lower()  # assuming 'dept' is in the second column
        # Check if dept is in Canada institutions, and set country accordingly
        country = 'canada' if dept in canada_institutions else 'us'
        # Add country to row and write to output file
        row.append(country)
        writer.writerow(row)
