import csv
import json

# Create a dictionary to store the data with institution as the key
data = {}

# Open and read the CSV file
with open('geolocation.csv', mode='r', encoding='utf-8') as file:
    reader = csv.reader(file)
    
    # Extract the header (first row) to use as keys in our JSON objects
    headers = next(reader)
    
    # Iterate through the remaining rows in the CSV file
    for row in reader:
        # Use the institution as the key and the other columns as associated values
        data[row[0]] = {headers[i]: row[i] for i in range(1, len(headers))}

# Convert the dictionary to JSON format and write to a file
with open('geolocation.json', mode='w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)
