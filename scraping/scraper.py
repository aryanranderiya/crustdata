import json
from bs4 import BeautifulSoup

# Load the HTML file
with open("info.html", "r", encoding="utf-8") as file:
    html_content = file.read()

# Parse the HTML content
soup = BeautifulSoup(html_content, "html.parser")


# Function to extract sections without duplication
def extract_sections(soup):
    sections = []
    seen_headers = set()  # To track added headers
    current_section = None

    for element in soup.find_all(["div", "h1", "h2", "h3", "p"]):
        # Check if the element is a header block
        if "notion-header-block" in element.get("class", []):
            header_text = element.get_text(strip=True)
            # Skip if header is already seen
            if header_text in seen_headers or header_text == "":
                continue
            seen_headers.add(header_text)  # Mark header as seen

            # Save the current section if it exists
            if current_section:
                sections.append(current_section)
            # Start a new section
            current_section = {"header": header_text, "content": []}
        elif current_section:  # Add content to the current section
            content_text = element.get_text(strip=True)
            if not any(
                item["text"] == content_text for item in current_section["content"]
            ):
                if content_text != "":
                    current_section["content"].append({"text": content_text})

    # Append the last section if it exists
    if current_section:
        sections.append(current_section)

    return sections


# Extract sections from HTML
sections = extract_sections(soup)

# Store the extracted sections in a JSON file
with open("sections.json", "w", encoding="utf-8") as json_file:
    json.dump(sections, json_file, ensure_ascii=False, indent=4)

print("Sections have been extracted and stored in 'sections.json'.")
