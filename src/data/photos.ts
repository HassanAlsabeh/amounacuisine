import type { ProductImage } from "@/lib/types";

/*
 * Product photos, from Wikimedia Commons under free licences (each keeps its author and
 * licence in `credit`, shown in the product details). Files live in public/products.
 * A photo uploaded in the admin panel replaces these.
 */
export const PHOTOS: Record<string, ProductImage> = {
  "potato-balls": {"src": "/products/potato-balls.jpg", "credit": "Be Hungry Cooking · CC BY-SA 4.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Potato_Balls_by_be_hungry.jpg", "alt": "Potato balls"},
  "pastries": {"src": "/products/pastries.jpg", "credit": "Krista · CC BY 2.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Heritage_village_fatayer_(11389764333).jpg", "alt": "Lebanese pastries"},
  "meal-300": {"src": "/products/meal-300.jpg", "credit": "براء · CC BY-SA 4.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Kabseh.jpg", "alt": "Home-cooked meal of chicken and rice"},
  "rkakat": {"src": "/products/rkakat.jpg", "credit": "CMoi · CC BY-SA 3.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Sigara_B%C3%B6re%C4%9Fi.JPG", "alt": "Rkakat cheese rolls"},
  "coxinha": {"src": "/products/coxinha.jpg", "credit": "Romerito Pontes from São Carlos · CC BY 2.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:(2014-11-22)_Hamburgueria_1282_-_S%C3%A3o_Carlos_-_Coxinha_especial_Romerito_Pontes_(15869475032).jpg", "alt": "Coxinha"},
  "vine-leaves-raw": {"src": "/products/vine-leaves-raw.jpg", "credit": "Oksana Makarenko (UA-Lora) · CC BY-SA 4.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Crimean_Tatar_sarma_Stage_7.jpg", "alt": "Rolled vine leaves ready to cook"},
  "shish-barak-kibbeh": {"src": "/products/shish-barak-kibbeh.jpg", "credit": "Peteravivangel · CC BY-SA 4.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Shish_barak.jpg", "alt": "Shish barak"},
  "kilo-meat": {"src": "/products/kilo-meat.jpg", "credit": "أمين · CC BY-SA 4.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Palestinian_Yaprak_sarma_002.jpg", "alt": "Stuffed vine leaves with meat"},
  "kilo-oil": {"src": "/products/kilo-oil.jpg", "credit": "Aseel zm · CC0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Yalanji_dish.jpg", "alt": "Stuffed vine leaves in olive oil"},
  "trays": {"src": "/products/trays.jpg", "credit": "Amaiursancho5 · CC BY-SA 4.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Kibbeh_Bil_Sanieh.jpg", "alt": "Kibbeh tray"},
  "kibbeh-fry": {"src": "/products/kibbeh-fry.jpg", "credit": "Bazel · CC BY-SA 3.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Kibbeh3.jpg", "alt": "Fried kibbeh"},
  "cabbage-rolls": {"src": "/products/cabbage-rolls.jpg", "credit": "Shixart1985 · CC BY 2.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Freshly_cooked_stuffed_cabbage_rolls_in_a_pot_on_a_wooden_table_ready_to_be_served_with_a_spoon.jpg", "alt": "Stuffed cabbage rolls"},
  "hero-spread": {"src": "/products/hero-spread.jpg", "credit": "Jj saezdeo · CC BY-SA 4.0 · Wikimedia Commons", "link": "https://commons.wikimedia.org/wiki/File:Traditional_lebanese_cuisine_table_setting.jpg", "alt": "A table of Lebanese home food"},
};
