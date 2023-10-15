import csv

sub_to_main_category = {
    "ASPLOS": "Computer architecture",
    "ISCA": "Computer architecture",
    "MICRO": "Computer architecture",
    "HPCA": "Computer architecture",
    "SIGCOMM": "Computer networks",
    "NSDI": "Computer networks",
    "CCS": "Computer security",
    "Oakland": "Computer security",
    "USENIX Security": "Computer security",
    "NDSS": "Computer security",
    "SIGMOD": "Databases",
    "VLDB": "Databases",
    "ICDE": "Databases",
    "PODS": "Databases",
    "DAC": "Design automation",
    "ICCAD": "Design automation",
    "EMSOFT": "Embedded & real-time systems",
    "RTAS": "Embedded & real-time systems",
    "RTSS": "Embedded & real-time systems",
    "HPDC": "High-performance computing",
    "ICS": "High-performance computing",
    "SC": "High-performance computing",
    "MobiCom": "Mobile computing",
    "MobiSys": "Mobile computing",
    "SenSys": "Mobile computing",
    "IMC": "Measurement & perf. analysis",
    "SIGMETRICS": "Measurement & perf. analysis",
    "OSDI": "Operating systems",
    "SOSP": "Operating systems",
    "EuroSys": "Operating systems",
    "FAST": "Operating systems",
    "USENIX ATC": "Operating systems",
    "PLDI": "Programming languages",
    "POPL": "Programming languages",
    "ICFP": "Programming languages",
    "OOPSLA": "Programming languages",
    "FSE": "Software engineering",
    "ICSE": "Software engineering",
    "ASE": "Software engineering",
    "ISSTA": "Software engineering",
}

input_filename = 'filtered-author-info.csv'
output_filename = 'category-replaced-author-info.csv'

# Convert sub_to_main_category keys to lowercase for case-insensitive comparison
sub_to_main_category = {k.lower(): v for k, v in sub_to_main_category.items()}

# Open the files
with open(input_filename, mode='r', newline='', encoding='utf-8') as infile, \
     open(output_filename, mode='w', newline='', encoding='utf-8') as outfile:

    # Create CSV reader and writer
    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    # Write header to output file (assuming there is a header)
    header = next(reader)
    writer.writerow(header)

    # Check the 'area' field in each row, replace with main category and write to output
    for row in reader:
        # Assuming 'area' is the third field
        area = row[2].lower()  # Convert to lowercase for case-insensitive comparison
        
        # Replace sub-category with main category
        main_category = sub_to_main_category.get(area, area)  # Default to original if not found
        
        # Write the modified row to output
        row[2] = main_category
        writer.writerow(row)
