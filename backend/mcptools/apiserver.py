import requests
import pprint
from fastmcp import FastMCP, Client
import os 

mcp = FastMCP("Food Facts Searcher")


def extract_product_text(response):
    products = response.get("products", [])
    texts = []

    for p in products[:5]:  # limit for quality
        name = p.get("product_name", "Unknown product")
        brands = p.get("brands", "Unknown brand")
        ingredients = p.get("ingredients_text", "No ingredients listed")
        nutriments = p.get("nutriments", {})

        sugar = nutriments.get("sugars_100g", "unknown")
        fat = nutriments.get("fat_100g", "unknown")
        calories = nutriments.get("energy-kcal_100g", "unknown")

        categories = p.get("categories_tags", [])
        categories_text = ", ".join(categories) if categories else "No categories"

        text = f"""
Product: {name}
Brand: {brands}
Ingredients: {ingredients}
Sugar per 100g: {sugar}
Fat per 100g: {fat}
Calories per 100g: {calories}
Categories: {categories_text}        
"""
        texts.append(text.strip())
    if len(texts) == 0: return None
    return texts[0]


# @mcp.tool()
def scrape_open_food_facts(query):
    """
    Search for food products on Open Food Facts and retrieve detailed product data.
    
    Use this tool when you need to find information about specific food items, 
    including ingredients, nutrition facts, brands, and allergens. 
    
    Args:
        query: The search term (e.g., 'Nutella', 'Coca Cola', 'Oat Milk'). 
               Can include product names or categories.
               
    Returns:
        A formatted string containing a list of matching products and their details.
    """
    query_url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1"
    response = requests.get(query_url).json()
    return extract_product_text(response)


def get_client():
    filename = os.path.abspath("mcptools/apiserver.py")
    return Client(filename)

# def main():
#     print(scrape_open_food_facts("apple juice"))

if __name__ == "__main__":
    mcp.run(transport="stdio")
