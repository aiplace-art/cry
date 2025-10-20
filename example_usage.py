#!/usr/bin/env python3
"""
Пример полного использования агента для бизнеса полезного питания
"""

from healthy_food_agent import HealthyFoodAgent

def full_demo():
    print("🎯 ПОЛНАЯ ДЕМОНСТРАЦИЯ АГЕНТА\n")
    
    # Создаем агента
    agent = HealthyFoodAgent()
    
    # Настраиваем ваш бизнес
    agent.setup_business(
        name="Фит Кухня",
        phone="+7 (495) 555-0123",
        instagram="fit_kitchen_moscow",
        address="Москва, Красная площадь, д. 1"
    )
    
    print()
    
    # Добавляем разнообразные блюда
    agent.add_menu_item(
        name="Лососевый стейк с авокадо",
        ingredients={
            "лосось": 120,
            "авокадо": 80,
            "брокколи": 100,
            "оливковое масло": 8
        },
        price=520,
        description="Сочный стейк лосося с кремовым авокадо и брокколи на пару"
    )
    
    agent.add_menu_item(
        name="Протеиновый завтрак",
        ingredients={
            "творог": 150,
            "яйцо": 60,
            "овсянка": 40
        },
        price=290,
        description="Идеальный завтрак для активного дня - творог с яйцом и овсянкой"
    )
    
    agent.add_menu_item(
        name="Говяжий салат",
        ingredients={
            "говядина": 100,
            "томаты": 80,
            "огурцы": 60,
            "оливковое масло": 12
        },
        price=410,
        description="Сытный салат с нежной говядиной и свежими овощами"
    )
    
    # Показываем меню
    print("\n" + "="*60)
    print(agent.generate_menu_display())
    print("="*60)
    
    # Генерируем пост для Instagram (разные стили)
    print("\n📱 ПРИМЕР ПОСТА ДЛЯ INSTAGRAM (стиль: фитнес):")
    print("="*60)
    instagram_post = agent.generate_instagram_post("Лососевый стейк с авокадо", "фитнес")
    print(instagram_post)
    
    print("\n📱 ПРИМЕР ПОСТА ДЛЯ INSTAGRAM (стиль: здоровое питание):")
    print("="*60)
    instagram_post2 = agent.generate_instagram_post("Протеиновый завтрак", "здоровое питание")
    print(instagram_post2)
    
    # Показываем статистику
    print("\n" + "="*40)
    stats = agent.get_business_stats()
    print(stats)
    print("="*40)
    
    # Создаем и сохраняем HTML-плакат
    print(f"\n🎨 Создаем HTML-плакат...")
    result = agent.save_flyer_to_file("my_business_flyer.html")
    print(result)
    
    # Показываем рекомендации по развитию
    print(f"\n💡 РЕКОМЕНДАЦИИ ПО РАЗВИТИЮ БИЗНЕСА:")
    print("─" * 50)
    print("1. 📈 Добавьте больше вегетарианских блюд")
    print("2. 🥤 Рассмотрите возможность добавления смузи")
    print("3. 🍰 Создайте раздел полезных десертов")
    print("4. 📅 Запланируйте еженедельные акции")
    print("5. 📊 Отслеживайте популярность блюд по заказам")
    print("6. 🎯 Создавайте тематические наборы (фитнес, детокс, набор массы)")

if __name__ == "__main__":
    full_demo()