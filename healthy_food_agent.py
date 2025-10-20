#!/usr/bin/env python3
"""
Агент для продвижения бизнеса по полезному питанию
Помогает с расчетом калорий, созданием меню, постов для Instagram и плакатов
"""

import json
from datetime import datetime
from typing import Dict, List, Optional
import re

class HealthyFoodAgent:
    def __init__(self):
        self.business_name = ""
        self.contact_info = {}
        self.menu_items = []
        
        # База данных калорийности продуктов (ккал на 100г)
        self.calories_db = {
            # Мясо и птица
            'куриная грудка': {'calories': 165, 'protein': 31, 'fat': 3.6, 'carbs': 0},
            'куриное филе': {'calories': 165, 'protein': 31, 'fat': 3.6, 'carbs': 0},
            'куриный фарш': {'calories': 143, 'protein': 17.4, 'fat': 8.1, 'carbs': 0},
            'говядина': {'calories': 250, 'protein': 26, 'fat': 15, 'carbs': 0},
            'говяжий стейк': {'calories': 250, 'protein': 26, 'fat': 15, 'carbs': 0},
            'фарш баранина': {'calories': 282, 'protein': 17, 'fat': 23, 'carbs': 0},
            'фарш говядина': {'calories': 254, 'protein': 17.2, 'fat': 20, 'carbs': 0},
            'индейка': {'calories': 157, 'protein': 21.6, 'fat': 7.3, 'carbs': 0},
            'филе индейки': {'calories': 157, 'protein': 21.6, 'fat': 7.3, 'carbs': 0},
            
            # Рыба и морепродукты
            'лосось': {'calories': 208, 'protein': 20, 'fat': 13, 'carbs': 0},
            'филе лосося': {'calories': 208, 'protein': 20, 'fat': 13, 'carbs': 0},
            'треска': {'calories': 78, 'protein': 17.7, 'fat': 0.7, 'carbs': 0},
            'филе трески': {'calories': 78, 'protein': 17.7, 'fat': 0.7, 'carbs': 0},
            'форель': {'calories': 97, 'protein': 19.2, 'fat': 2.1, 'carbs': 0},
            'филе форели': {'calories': 97, 'protein': 19.2, 'fat': 2.1, 'carbs': 0},
            
            # Молочные продукты
            'яйцо': {'calories': 155, 'protein': 13, 'fat': 11, 'carbs': 1.1},
            'творог': {'calories': 103, 'protein': 18, 'fat': 4, 'carbs': 3.4},
            'молоко нежирное': {'calories': 31, 'protein': 3, 'fat': 0.1, 'carbs': 4.7},
            'масло сливочное': {'calories': 717, 'protein': 0.8, 'fat': 82.5, 'carbs': 0.8},
            
            # Крупы и зерновые
            'рис': {'calories': 130, 'protein': 2.7, 'fat': 0.3, 'carbs': 28},
            'рис сухой': {'calories': 344, 'protein': 7.5, 'fat': 2.6, 'carbs': 74},
            'гречка': {'calories': 343, 'protein': 13, 'fat': 3.4, 'carbs': 62},
            'гречка сухая': {'calories': 343, 'protein': 13, 'fat': 3.4, 'carbs': 62},
            'овсянка': {'calories': 389, 'protein': 17, 'fat': 6.9, 'carbs': 66},
            'булгур': {'calories': 342, 'protein': 12.3, 'fat': 1.3, 'carbs': 75.9},
            'булгур сухой': {'calories': 342, 'protein': 12.3, 'fat': 1.3, 'carbs': 75.9},
            'киноа': {'calories': 368, 'protein': 14.1, 'fat': 6.1, 'carbs': 64.2},
            'киноа сухая': {'calories': 368, 'protein': 14.1, 'fat': 6.1, 'carbs': 64.2},
            'хлеб цельнозерновой': {'calories': 213, 'protein': 7.4, 'fat': 1.2, 'carbs': 41},
            
            # Овощи
            'картофель': {'calories': 77, 'protein': 2, 'fat': 0.1, 'carbs': 17},
            'брокколи': {'calories': 34, 'protein': 2.8, 'fat': 0.4, 'carbs': 7},
            'кабачок': {'calories': 17, 'protein': 1.2, 'fat': 0.3, 'carbs': 4.6},
            'тыква': {'calories': 26, 'protein': 1, 'fat': 0.1, 'carbs': 6.5},
            'томаты': {'calories': 18, 'protein': 0.9, 'fat': 0.2, 'carbs': 3.9},
            'помидор': {'calories': 18, 'protein': 0.9, 'fat': 0.2, 'carbs': 3.9},
            'помидоры': {'calories': 18, 'protein': 0.9, 'fat': 0.2, 'carbs': 3.9},
            'огурцы': {'calories': 16, 'protein': 0.7, 'fat': 0.1, 'carbs': 4},
            'огурец': {'calories': 16, 'protein': 0.7, 'fat': 0.1, 'carbs': 4},
            'перец болгарский': {'calories': 27, 'protein': 1.3, 'fat': 0, 'carbs': 5.3},
            'перец': {'calories': 27, 'protein': 1.3, 'fat': 0, 'carbs': 5.3},
            'лук репчатый': {'calories': 41, 'protein': 1.4, 'fat': 0, 'carbs': 10.4},
            'лук': {'calories': 41, 'protein': 1.4, 'fat': 0, 'carbs': 10.4},
            'морковь': {'calories': 35, 'protein': 1.3, 'fat': 0.1, 'carbs': 6.9},
            'спаржа': {'calories': 20, 'protein': 1.9, 'fat': 0.1, 'carbs': 3.4},
            'шпинат': {'calories': 22, 'protein': 2.9, 'fat': 0.4, 'carbs': 2.0},
            'зелень': {'calories': 36, 'protein': 3.7, 'fat': 0.4, 'carbs': 5.2},
            'петрушка': {'calories': 36, 'protein': 3.7, 'fat': 0.4, 'carbs': 7.6},
            'кинза': {'calories': 23, 'protein': 2.1, 'fat': 0.5, 'carbs': 3.7},
            'зелёный горошек': {'calories': 81, 'protein': 5, 'fat': 0.4, 'carbs': 14.5},
            
            # Фрукты
            'авокадо': {'calories': 160, 'protein': 2, 'fat': 15, 'carbs': 9},
            'ананас': {'calories': 50, 'protein': 0.5, 'fat': 0.2, 'carbs': 13.1},
            'ананас свежий': {'calories': 50, 'protein': 0.5, 'fat': 0.2, 'carbs': 13.1},
            
            # Масла и жиры
            'оливковое масло': {'calories': 884, 'protein': 0, 'fat': 100, 'carbs': 0},
            'растительное масло': {'calories': 899, 'protein': 0, 'fat': 99.9, 'carbs': 0},
            
            # Специи и приправы
            'чеснок': {'calories': 149, 'protein': 6.5, 'fat': 0.5, 'carbs': 33},
            'соевый соус': {'calories': 8, 'protein': 1.3, 'fat': 0, 'carbs': 0.8},
            'мед': {'calories': 304, 'protein': 0.3, 'fat': 0, 'carbs': 82.4},
            'кунжут': {'calories': 573, 'protein': 17.7, 'fat': 49.7, 'carbs': 23.4},
            'лимонный сок': {'calories': 16, 'protein': 0.4, 'fat': 0.1, 'carbs': 3}
        }
    
    def setup_business(self, name: str, phone: str, instagram: str, address: str = ""):
        """Настройка информации о бизнесе"""
        self.business_name = name
        self.contact_info = {
            'phone': phone,
            'instagram': instagram,
            'address': address
        }
        print(f"✅ Бизнес '{name}' настроен!")
    
    def calculate_nutrition(self, ingredients: Dict[str, float]) -> Dict[str, float]:
        """
        Расчет БЖУ и калорий для блюда
        ingredients: {'продукт': вес_в_граммах}
        """
        total_nutrition = {'calories': 0, 'protein': 0, 'fat': 0, 'carbs': 0}
        
        for ingredient, weight in ingredients.items():
            ingredient_lower = ingredient.lower()
            if ingredient_lower in self.calories_db:
                nutrition = self.calories_db[ingredient_lower]
                # Расчет на указанный вес
                for key in total_nutrition:
                    total_nutrition[key] += nutrition[key] * weight / 100
        
        return {
            'calories': round(total_nutrition['calories'], 1),
            'protein': round(total_nutrition['protein'], 1),
            'fat': round(total_nutrition['fat'], 1),
            'carbs': round(total_nutrition['carbs'], 1)
        }
    
    def add_menu_item(self, name: str, ingredients: Dict[str, float], price: int, description: str = ""):
        """Добавить блюдо в меню"""
        nutrition = self.calculate_nutrition(ingredients)
        
        menu_item = {
            'name': name,
            'ingredients': ingredients,
            'nutrition': nutrition,
            'price': price,
            'description': description
        }
        
        self.menu_items.append(menu_item)
        print(f"✅ Блюдо '{name}' добавлено в меню!")
        print(f"   📊 {nutrition['calories']} ккал | Б: {nutrition['protein']}г | Ж: {nutrition['fat']}г | У: {nutrition['carbs']}г")
    
    def generate_menu_display(self) -> str:
        """Создание красивого меню для отображения"""
        if not self.menu_items:
            return "❌ Меню пустое. Добавьте блюда!"
        
        menu_text = f"""
🍽️ МЕНЮ {self.business_name.upper()}
{'=' * 50}

"""
        
        for item in self.menu_items:
            nutrition = item['nutrition']
            menu_text += f"""
🥗 {item['name'].upper()}
{item['description']}

📊 Пищевая ценность:
• Калории: {nutrition['calories']} ккал
• Белки: {nutrition['protein']}г
• Жиры: {nutrition['fat']}г  
• Углеводы: {nutrition['carbs']}г

💰 Цена: {item['price']} руб.
{'─' * 40}
"""
        
        # Добавляем контакты
        menu_text += f"""
📞 КОНТАКТЫ:
• Телефон: {self.contact_info.get('phone', 'не указан')}
• Instagram: @{self.contact_info.get('instagram', 'не указан')}
"""
        
        if self.contact_info.get('address'):
            menu_text += f"• Адрес: {self.contact_info['address']}\n"
        
        menu_text += "\n📱 Подпишись на канал!"
        
        return menu_text
    
    def generate_instagram_post(self, dish_name: str, style: str = "здоровое питание") -> str:
        """Генерация поста для Instagram"""
        dish = next((item for item in self.menu_items if item['name'].lower() == dish_name.lower()), None)
        
        if not dish:
            return f"❌ Блюдо '{dish_name}' не найдено в меню!"
        
        nutrition = dish['nutrition']
        
        # Выбираем эмодзи в зависимости от стиля
        emoji_sets = {
            "здоровое питание": ["🥗", "🌱", "💚", "🍃", "✨"],
            "фитнес": ["💪", "🔥", "🏋️", "🥇", "⚡"],
            "диета": ["🌿", "🥒", "🥑", "🍋", "💫"]
        }
        
        emojis = emoji_sets.get(style, emoji_sets["здоровое питание"])
        
        post = f"""{emojis[0]} {dish['name'].upper()} {emojis[1]}

{dish['description']}

📊 ПИЩЕВАЯ ЦЕННОСТЬ НА ПОРЦИЮ:
{emojis[2]} Калории: {nutrition['calories']} ккал
🥩 Белки: {nutrition['protein']}г  
🥑 Жиры: {nutrition['fat']}г
🌾 Углеводы: {nutrition['carbs']}г

💰 Цена: {dish['price']} руб.

{emojis[3]} Заказывайте полезную еду с доставкой!
{emojis[4]} Каждое блюдо - это забота о вашем здоровье!

📞 Заказ: {self.contact_info.get('phone', 'ссылка в профиле')}

#здоровоепитание #пп #правильноепитание #полезнаяеда #фитнеседа 
#доставкаеды #{self.business_name.lower().replace(' ', '')} #калории #бжу
#здоровье #диета #правильныйрацион #домашняяеда #вкусноиполезно
"""
        
        return post
    
    def create_promotional_flyer(self) -> str:
        """Создание HTML-макета рекламного плаката"""
        if not self.menu_items:
            return "❌ Сначала добавьте блюда в меню!"
        
        html_content = f"""
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Меню - {self.business_name}</title>
    <style>
        body {{
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            color: white;
        }}
        
        .flyer {{
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            color: #333;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        
        .business-name {{
            font-size: 2.5em;
            font-weight: bold;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }}
        
        .subtitle {{
            font-size: 1.2em;
            color: #666;
            margin-bottom: 20px;
        }}
        
        .menu-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        
        .menu-item {{
            background: white;
            border: 2px solid #f0f0f0;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }}
        
        .menu-item:hover {{
            transform: translateY(-5px);
            border-color: #667eea;
        }}
        
        .dish-name {{
            font-size: 1.4em;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }}
        
        .nutrition {{
            background: #f8f9ff;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
        }}
        
        .nutrition-row {{
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }}
        
        .price {{
            font-size: 1.5em;
            font-weight: bold;
            color: #27ae60;
            text-align: center;
            margin-top: 15px;
        }}
        
        .contacts {{
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
        }}
        
        .contacts h3 {{
            margin-top: 0;
            font-size: 1.5em;
        }}
        
        .contact-info {{
            font-size: 1.1em;
            line-height: 1.8;
        }}
        
        .cta {{
            background: #e74c3c;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 20px;
            display: inline-block;
            text-decoration: none;
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
        }}
    </style>
</head>
<body>
    <div class="flyer">
        <div class="header">
            <h1 class="business-name">{self.business_name}</h1>
            <p class="subtitle">🍽️ Полезное питание с подсчетом калорий 🌱</p>
        </div>
        
        <div class="menu-grid">
"""
        
        # Добавляем блюда
        for item in self.menu_items:
            nutrition = item['nutrition']
            html_content += f"""
            <div class="menu-item">
                <h3 class="dish-name">🥗 {item['name']}</h3>
                <p>{item['description']}</p>
                
                <div class="nutrition">
                    <div class="nutrition-row">
                        <span><strong>Калории:</strong></span>
                        <span>{nutrition['calories']} ккал</span>
                    </div>
                    <div class="nutrition-row">
                        <span><strong>Белки:</strong></span>
                        <span>{nutrition['protein']}г</span>
                    </div>
                    <div class="nutrition-row">
                        <span><strong>Жиры:</strong></span>
                        <span>{nutrition['fat']}г</span>
                    </div>
                    <div class="nutrition-row">
                        <span><strong>Углеводы:</strong></span>
                        <span>{nutrition['carbs']}г</span>
                    </div>
                </div>
                
                <div class="price">💰 {item['price']} руб.</div>
            </div>
"""
        
        html_content += f"""
        </div>
        
        <div class="contacts">
            <h3>📞 КОНТАКТЫ ДЛЯ ЗАКАЗА</h3>
            <div class="contact-info">
                <p><strong>📱 Телефон:</strong> {self.contact_info.get('phone', 'не указан')}</p>
                <p><strong>📸 Instagram:</strong> @{self.contact_info.get('instagram', 'не указан')}</p>
"""
        
        if self.contact_info.get('address'):
            html_content += f"                <p><strong>📍 Адрес:</strong> {self.contact_info['address']}</p>\n"
        
        html_content += """
            </div>
            <div class="cta">📱 ПОДПИШИСЬ НА КАНАЛ!</div>
        </div>
    </div>
</body>
</html>
"""
        
        return html_content
    
    def save_flyer_to_file(self, filename: str = None) -> str:
        """Сохранение флаера в HTML файл"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"flyer_{self.business_name.replace(' ', '_').lower()}_{timestamp}.html"
        
        html_content = self.create_promotional_flyer()
        
        if html_content.startswith("❌"):
            return html_content
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(html_content)
            return f"✅ Флаер сохранен в файл: {filename}"
        except Exception as e:
            return f"❌ Ошибка при сохранении: {e}"
    
    def get_business_stats(self) -> str:
        """Статистика по меню и ценам"""
        if not self.menu_items:
            return "❌ Меню пустое!"
        
        total_items = len(self.menu_items)
        avg_price = sum(item['price'] for item in self.menu_items) / total_items
        avg_calories = sum(item['nutrition']['calories'] for item in self.menu_items) / total_items
        
        min_price = min(item['price'] for item in self.menu_items)
        max_price = max(item['price'] for item in self.menu_items)
        
        stats = f"""
📊 СТАТИСТИКА МЕНЮ
{'=' * 30}

📋 Общее количество блюд: {total_items}
💰 Средняя цена: {avg_price:.0f} руб.
📊 Средняя калорийность: {avg_calories:.0f} ккал

💵 Самое дешевое блюдо: {min_price} руб.
💎 Самое дорогое блюдо: {max_price} руб.

🏷️ Рекомендуемые цены для новых блюд: {int(avg_price * 0.8)}-{int(avg_price * 1.2)} руб.
"""
        return stats

# Пример использования агента
def demo_usage():
    """Демонстрация работы агента"""
    print("🚀 Запуск агента для продвижения бизнеса полезного питания!\n")
    
    # Создаем агента
    agent = HealthyFoodAgent()
    
    # Настраиваем бизнес
    agent.setup_business(
        name="Healthy Kitchen",
        phone="+7 (999) 123-45-67",
        instagram="healthy_kitchen_msk",
        address="г. Москва, ул. Здоровья, д. 1"
    )
    
    # Добавляем блюда в меню
    agent.add_menu_item(
        name="Куриная грудка с овощами",
        ingredients={"куриная грудка": 150, "брокколи": 100, "томаты": 50, "оливковое масло": 10},
        price=350,
        description="Нежная куриная грудка с паровыми овощами и томатами"
    )
    
    agent.add_menu_item(
        name="Творожная запеканка",
        ingredients={"творог": 200, "яйцо": 50, "овсянка": 30},
        price=280,
        description="Воздушная творожная запеканка с овсяными хлопьями"
    )
    
    print("\n" + "="*50)
    print(agent.generate_menu_display())
    print("="*50)
    
    return agent

if __name__ == "__main__":
    demo_usage()